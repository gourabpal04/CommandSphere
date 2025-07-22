// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to check API health
Cypress.Commands.add('checkApiHealth', () => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/health`,
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('status', 'healthy');
  });
});

// Custom command to wait for app to be ready
Cypress.Commands.add('waitForApp', () => {
  cy.visit('/', { timeout: 60000 });
  cy.get('body', { timeout: 30000 }).should('be.visible');
});

// Custom command to create a status check via API
Cypress.Commands.add('createStatusCheck', (clientName) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/status`,
    body: {
      client_name: clientName
    }
  });
});

// Custom command to get all status checks
Cypress.Commands.add('getStatusChecks', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/status`
  });
});