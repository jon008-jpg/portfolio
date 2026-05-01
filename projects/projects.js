import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// 1. Initial Data Fetch
const projects = await fetchJSON('../lib/projects.json'); 
const projectsContainer = document.querySelector('.projects');

// --- Global State (The "Single Source of Truth") ---
let query = '';
let selectedIndex = -1;

// 2. Initial Render
if (projects && projectsContainer) {
    renderProjects(projects, projectsContainer, 'h2');
    renderPieChart(projects);
}

// 3. Unified Filtering Function
function filterProjects() {
    // Apply search filter
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    // Apply year filter (if a wedge is selected)
    // We need to re-calculate the rolled data to know what the labels are
    if (selectedIndex !== -1) {
        let rolledData = d3.rollups(
            filteredProjects, // We group the search results
            (v) => v.length,
            (d) => d.year
        );
        let years = rolledData.map(([year]) => year);
        let selectedYear = years[selectedIndex];
        
        filteredProjects = filteredProjects.filter(p => p.year === selectedYear);
    }

    // Render the final intersection of both filters
    renderProjects(filteredProjects, projectsContainer, 'h2');
}

// 4. Search Bar Listener
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    filterProjects(); // Apply both filters
    
    // We also need to update the Pie Chart so it reflects the search results
    // But we DON'T reset selectedIndex here anymore!
    let filteredBySearchOnly = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    renderPieChart(filteredBySearchOnly);
});

// 5. Refactored Pie Chart Function
function renderPieChart(projectsGiven) {
    let svg = d3.select('#projects-plot');
    svg.selectAll('path').remove();
    let legend = d3.select('.legend');
    legend.selectAll('*').remove();

    let rolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);
    let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value(d => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map(d => arcGenerator(d));

    arcs.forEach((arc, i) => {
        svg.append('path')
           .attr('d', arc)
           .attr('fill', colors(i))
           .attr('class', i === selectedIndex ? 'selected' : '') // Maintain selection on re-render
           .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;

                // Update visual highlights
                svg.selectAll('path')
                   .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

                legend.selectAll('li')
                      .attr('class', (_, idx) => (idx === selectedIndex ? 'legend-item selected' : 'legend-item'));

                // Apply the combined filters
                filterProjects();
           });
    });

    data.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
              .on('click', () => {
                svg.selectAll('path').filter((_, i) => i === idx).dispatch('click');
              });
    });
}