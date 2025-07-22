describe('CommandSphere App E2E Tests', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should load the homepage successfully', () => {
    // Check that the page loads
    cy.get('.App-header').should('be.visible')
    cy.get('.App-link').should('be.visible')
    cy.contains('Building something incredible ~!').should('be.visible')
  })

  it('should have correct page title and meta information', () => {
    // Check page title
    cy.title().should('not.be.empty')
    
    // Check that React app is loaded
    cy.get('.App').should('exist')
  })

  it('should display the Emergent logo with correct attributes', () => {
    // Check logo image
    cy.get('.App-link img')
      .should('be.visible')
      .should('have.attr', 'src')
      .and('include', 'githubusercontent.com')
    
    // Check link attributes
    cy.get('.App-link')
      .should('have.attr', 'href', 'https://emergent.sh')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
  })

  it('should make API call on page load', () => {
    // Intercept the API call that happens on page load
    cy.intercept('GET', '**/api/', { message: 'Hello World' }).as('helloWorldApi')
    
    // Reload to trigger the API call
    cy.reload()
    cy.waitForPageLoad()
    
    // Wait for API call
    cy.wait('@helloWorldApi').then((interception) => {
      expect(interception.response.statusCode).to.eq(200)
    })
  })

  it('should handle navigation correctly', () => {
    // Test that React Router is working
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Test that browser navigation works
    cy.go('back')
    cy.go('forward')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should be responsive on different screen sizes', () => {
    // Test mobile view
    cy.viewport(375, 667)
    cy.get('.App-header').should('be.visible')
    cy.get('.App-link img').should('be.visible')
    
    // Test tablet view
    cy.viewport(768, 1024)
    cy.get('.App-header').should('be.visible')
    
    // Test desktop view
    cy.viewport(1280, 800)
    cy.get('.App-header').should('be.visible')
  })

  it('should handle console errors gracefully', () => {
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError')
    })
    
    cy.reload()
    cy.waitForPageLoad()
    
    // Check that no critical console errors occurred
    cy.get('@consoleError').should('not.have.been.calledWith', Cypress.sinon.match(/Error/))
  })
})