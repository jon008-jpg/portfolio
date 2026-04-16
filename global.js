console.log('IT’S ALIVE!');

/**
 * Helper function to select multiple elements and return them as an array
 */
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2.1: Get an array of all navigation links
let navLinks = $$("nav a");

// Step 2.2: Find the link that matches the current page's URL
let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

// Step 2.3: Add the 'current' class to that specific link (if found)
currentLink?.classList.add('current');