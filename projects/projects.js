import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// 1. Fetch and Render Projects
// We are fetching the DATA file, not the code file!
const projects = await fetchJSON('../project.json'); 

const projectsContainer = document.querySelector('.projects');

if (projects && projectsContainer) {
    renderProjects(projects, projectsContainer, 'h2');

    const projectsTitle = document.querySelector('.projects-title');
    if (projectsTitle) {
        projectsTitle.textContent = `${projects.length} Projects`;
    }
}

// 2. Pie Chart Logic
// Using hardcoded data for now to ensure the chart renders
let data = [1, 2];
let colors = ['gold', 'purple'];

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie();

let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let svg = d3.select('#projects-plot');
svg.selectAll('path').remove();

arcs.forEach((arc, idx) => {
    svg.append('path')
       .attr('d', arc)
       .attr('fill', colors[idx]);
});