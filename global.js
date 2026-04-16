console.log('IT’S ALIVE!');

/**
 * Helper function to select multiple elements and return them as an array
 */
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}