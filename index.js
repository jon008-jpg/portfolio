// 1. Update your import line to include fetchGitHubData
import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

// ... (Your existing projects fetching/rendering code) ...

// 2. Fetch your GitHub data
// Using your username 'jon008-jpg'
const githubData = await fetchGitHubData('jon008-jpg');

// 3. Select the container
const profileStats = document.querySelector('#profile-stats');

// 4. Inject the data if the container exists
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