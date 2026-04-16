console.log('IT’S ALIVE!');

/**
 * Helper function to select multiple elements and return them as an array
 */
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// // Step 2.1: Get an array of all navigation links
// let navLinks = $$("nav a");

// // Step 2.2: Find the link that matches the current page's URL
// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
// );

// // Step 2.3: Add the 'current' class to that specific link (if found)
// currentLink?.classList.add('current');

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
  : "/portfolio/"; // Adjusted for your repo name

// 3. Create the <nav> and add it to the top of the body
let nav = document.createElement('nav');
document.body.prepend(nav);

// 4. Loop through pages and create links
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Adjust the URL if it's internal (relative)
    url = !url.startsWith('http') ? BASE_PATH + url : url;

    // Create the link element
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // Highlight the current page
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    // Open external links in a new tab
    if (a.host !== location.host) {
        a.target = "_blank";
    }

    nav.append(a);
}
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

// Helper function to set the scheme and sync the dropdown
function setColorScheme(color) {
  document.documentElement.style.setProperty('color-scheme', color);
  select.value = color;
}

// Step 4.5: Load saved preference on page load
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

// Step 4.4: Handle user changes
select.addEventListener('input', function (event) {
  const color = event.target.value;
  setColorScheme(color);
  localStorage.colorScheme = color; // Save to storage
});

// Step 5: Better contact form handling
const form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
    // Stop the browser from doing its default submission
    event.preventDefault();

    // Create a FormData object to easily extract input values
    const data = new FormData(form);

    // Start building our mailto URL
    // form.action is "mailto:jon008@ucsd.edu"
    let url = form.action + "?";

    // Loop through the form fields (subject and body)
    for (let [name, value] of data) {
        // Encode characters like spaces to %20 so email clients understand them
        url += `${name}=${encodeURIComponent(value)}&`;
    }

    // Remove the very last '&' character we added in the loop
    url = url.slice(0, -1);

    // Open the user's email client with our perfectly formatted URL
    location.href = url;
});