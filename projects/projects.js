import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// 1. Fetch and Render Projects
const projects = await fetchJSON('../lib/projects.json'); 
const projectsContainer = document.querySelector('.projects');

if (projects && projectsContainer) {
    renderProjects(projects, projectsContainer, 'h2');

    const projectsTitle = document.querySelector('.projects-title');
    if (projectsTitle) {
        projectsTitle.textContent = `${projects.length} Projects`;
    }

    renderPieChart(projects);
}

function renderPieChart(projects) {
    // --- Step 2.1 & 2.2: Static data with Legend ---
    
    let data = [
        { value: 1, label: 'apples' },
        { value: 2, label: 'oranges' },
        { value: 3, label: 'mangos' },
        { value: 4, label: 'pears' },
        { value: 5, label: 'limes' },
        { value: 5, label: 'cherries' },
    ];

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Render SVG Paths
    let svg = d3.select('#projects-plot');
    svg.selectAll('path').remove();
    arcs.forEach((arc, idx) => {
        svg.append('path')
           .attr('d', arc)
           .attr('fill', colors(idx)); 
    });

    // --- Legend Generation ---
    let legend = d3.select('.legend');
    legend.selectAll('*').remove(); // Clear previous legend items

    data.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .attr('class', 'legend-item') // Added a class for styling
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}