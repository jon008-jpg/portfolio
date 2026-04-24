import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

// --- PART 1: PROJECTS ---
// Fetch all projects from the lib folder
const projects = await fetchJSON('./lib/projects.json');

// Slice the array to get only the first 3 projects
const latestProjects = projects.slice(0, 3);

// Select the projects container
const projectsContainer = document.querySelector('.projects');

// Render the sliced list into the container
if (projectsContainer) {
    renderProjects(latestProjects, projectsContainer, 'h2');
}

// --- PART 2: GITHUB STATS ---
// Fetch your GitHub data
const githubData = await fetchGitHubData('jon008-jpg');

// Select the profile stats container
const profileStats = document.querySelector('#profile-stats');

// Inject the data if the container exists
if (profileStats) {
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers</dt><dd>${githubData.followers}</dd>
            <dt>Following</dt><dd>${githubData.following}</dd>
          </dl>
      `;
}