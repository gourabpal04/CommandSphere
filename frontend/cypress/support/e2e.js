// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in command log for cleaner test output
Cypress.on('window:before:load', (win) => {
  cy.stub(win.console, 'error').as('consoleError')
})

// Global before hook
beforeEach(() => {
  // Intercept API calls for better test reliability
  cy.intercept('GET', '**/api/**').as('apiCall')
})