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

// --- Step 1.4: Drawing a static pie chart with D3 ---

// 1. Define the data and colors
let data = [1, 2];
let colors = ['gold', 'purple'];

// 2. Setup the generators
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie();

// 3. Generate the data for the slices (angles)
let arcData = sliceGenerator(data);

// 4. Generate the path strings from those angles
let arcs = arcData.map((d) => arcGenerator(d));

// 5. Select the SVG and append paths
let svg = d3.select('#projects-plot');

// Clear any existing paths before drawing new ones (good practice!)
svg.selectAll('path').remove();

arcs.forEach((arc, idx) => {
    svg.append('path')
       .attr('d', arc)
       .attr('fill', colors[idx]); // Indexing into our colors array
});