// <root repo>/projects/projects.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// Existing project loading logic
const projects = await fetchJSON('../project.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}

// --- Step 1.3: Drawing our circle path with D3 ---

// 1. Create the arc generator
// innerRadius(0) makes it a full pie slice; changing it > 0 makes it a donut!
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// 2. Generate the path data for a full circle (0 to 2π radians)
let arc = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});

// 3. Append the path to our SVG using D3
d3.select('#projects-plot')
  .append('path')
  .attr('d', arc)
  .attr('fill', 'red');