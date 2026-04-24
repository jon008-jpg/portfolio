import { fetchJSON, renderProjects } from '../global.js';

// Fetch the data from our new JSON file
const projects = await fetchJSON('../lib/projects.json');

// Select the empty container in our HTML
const projectsContainer = document.querySelector('.projects');

// Render them!
renderProjects(projects, projectsContainer, 'h2');

// Select the title element
const projectsTitle = document.querySelector('.projects-title');

// Update the text to show the count
if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}