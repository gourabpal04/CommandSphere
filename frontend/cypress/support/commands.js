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
    timeout: 10000
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.have.property('status', 'healthy')
    expect(response.body).to.have.property('database', 'connected')
  })
})

// Custom command to create a status check
Cypress.Commands.add('createStatusCheck', (clientName) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/status`,
    body: { client_name: clientName },
    headers: { 'Content-Type': 'application/json' }
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.have.property('client_name', clientName)
    expect(response.body).to.have.property('id')
    return cy.wrap(response.body)
  })
})

// Custom command to get all status checks
Cypress.Commands.add('getStatusChecks', () => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/status`,
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.be.an('array')
    return cy.wrap(response.body)
  })
})

// Custom command to wait for page to load completely
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.window().should('have.property', 'document')
  cy.document().should('have.property', 'readyState', 'complete')
})

// Add console log command for debugging
Cypress.Commands.add('log', (message) => {
  cy.task('log', message)
})