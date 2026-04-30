console.log('IT’S ALIVE!');

/**
 * Helper function to select multiple elements and return them as an array
 */
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// 1. Define your pages
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/jon008-jpg', title: 'GitHub' },
];

// 2. Detect if we are local or on GitHub Pages
const ARE_WE_HOME = document.documentElement.classList.contains('home');
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  
  : "/portfolio/"; 

// 3. Create the <nav> and add it to the top of the body
let nav = document.createElement('nav');
document.body.prepend(nav);

// 4. Loop through pages and create links
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    url = !url.startsWith('http') ? BASE_PATH + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host) {
        a.target = "_blank";
    }

    nav.append(a);
}

// 5. Insert the theme selector BEFORE the nav
document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <label class="color-scheme">
        Theme:
        <select>
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>`
);

const select = document.querySelector('.color-scheme select');

function setColorScheme(color) {
  document.documentElement.style.setProperty('color-scheme', color);
  select.value = color;
}

if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  const color = event.target.value;
  setColorScheme(color);
  localStorage.colorScheme = color; 
});

// Step 5: Better contact form handling
const form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
    event.preventDefault();
    const data = new FormData(form);
    let url = form.action + "?";

    for (let [name, value] of data) {
        url += `${name}=${encodeURIComponent(value)}&`;
    }

    url = url.slice(0, -1);
    location.href = url;
});

export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    projects.forEach(project => {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="${project.title}">
            <div class="project-info">
                <p>${project.description}</p>
                <p class="project-year">c. ${project.year}</p>
            </div>
        `;
        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}