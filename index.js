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
const githubData = await fetchGitHubData('jon008-jpg');
const profileStats = document.querySelector('#profile-stats');

if (profileStats && githubData) {
    profileStats.innerHTML = `
          <dl class="stats">
            <div class="stat-pair">
                <dt>Followers</dt>
                <dd>${githubData.followers}</dd>
            </div>
            <div class="stat-pair">
                <dt>Following</dt>
                <dd>${githubData.following}</dd>
            </div>
            <div class="stat-pair">
                <dt>Public Repos</dt>
                <dd>${githubData.public_repos}</dd>
            </div>
            <div class="stat-pair">
                <dt>Public Gists</dt>
                <dd>${githubData.public_gists}</dd>
            </div>
          </dl>
      `;
}