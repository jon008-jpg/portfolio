// 1. Import our reusable functions from global.js
// Note: We use './' because global.js is in the same folder as index.js
import { fetchJSON, renderProjects } from './global.js';

// 2. Fetch all projects from the lib folder
const projects = await fetchJSON('./lib/projects.json');

// 3. Slice the array to get only the first 3 projects
const latestProjects = projects.slice(0, 3);

// 4. Select the container where we want to put the projects
const projectsContainer = document.querySelector('.projects');

// 5. Render the sliced list into the container
// We check if the container exists first to prevent errors
if (projectsContainer) {
    renderProjects(latestProjects, projectsContainer, 'h2');
}