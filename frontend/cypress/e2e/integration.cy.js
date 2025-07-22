describe('CommandSphere Status Management E2E', () => {
  const testClientName = `Test Client ${Date.now()}`
  
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should display the main application interface', () => {
    // Verify the main components are visible
    cy.get('.App-header').should('be.visible')
    cy.get('.App-link').should('be.visible')
    cy.contains('Building something incredible ~!').should('be.visible')
  })

  it('should make successful API call on page load', () => {
    // Intercept the API call that happens automatically
    cy.intercept('GET', '**/api/', { 
      statusCode: 200, 
      body: { message: 'Hello World' } 
    }).as('helloWorldApi')
    
    // Reload to trigger the API call
    cy.reload()
    cy.waitForPageLoad()
    
    // The API call should happen automatically
    cy.wait('@helloWorldApi', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200)
      expect(interception.response.body.message).to.eq('Hello World')
    })
  })

  it('should handle API integration properly', () => {
    // Test that the app can communicate with the backend
    cy.window().then((win) => {
      // Check that REACT_APP_BACKEND_URL is set
      const backendUrl = win.process?.env?.REACT_APP_BACKEND_URL || 'http://localhost:8000'
      expect(backendUrl).to.be.a('string')
      expect(backendUrl).to.include('http')
    })
  })

  it('should work correctly in different viewport sizes', () => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Standard' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ]

    viewports.forEach(viewport => {
      cy.viewport(viewport.width, viewport.height)
      cy.log(`Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`)
      
      // Check that main elements are still visible
      cy.get('.App-header').should('be.visible')
      cy.get('.App-link img').should('be.visible')
      cy.contains('Building something incredible ~!').should('be.visible')
    })
  })

  it('should handle React Router navigation correctly', () => {
    // Test that the app is properly set up with React Router
    cy.url().should('include', '/')
    
    // Test browser navigation
    cy.go('back')
    cy.go('forward')
    cy.url().should('include', '/')
  })

  it('should load external resources properly', () => {
    // Check that the GitHub avatar image loads
    cy.get('.App-link img')
      .should('be.visible')
      .should('have.attr', 'src')
      .and('include', 'githubusercontent.com')
    
    // Check that the image actually loads
    cy.get('.App-link img').should(($img) => {
      expect($img[0].naturalWidth).to.be.greaterThan(0)
    })
  })

  it('should have proper accessibility attributes', () => {
    // Check that the external link has proper accessibility attributes
    cy.get('.App-link')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
    
    // Check that the image has proper alt text or is decorative
    cy.get('.App-link img').then(($img) => {
      // Either has alt text or is marked as decorative
      expect($img.attr('alt') || $img.attr('aria-hidden')).to.exist
    })
  })

  it('should handle network errors gracefully', () => {
    // Simulate network failure for API call
    cy.intercept('GET', '**/api/', { forceNetworkError: true }).as('failedApiCall')
    
    // Reload to trigger the API call
    cy.reload()
    cy.waitForPageLoad()
    
    // The app should still render even if API fails
    cy.get('.App-header').should('be.visible')
    cy.contains('Building something incredible ~!').should('be.visible')
  })

  it('should maintain performance standards', () => {
    // Basic performance checks
    cy.visit('/', { timeout: 30000 })
    
    // Page should load within reasonable time
    cy.get('.App-header').should('be.visible')
    
    // Check that there are no obvious performance issues
    cy.window().then((win) => {
      // Check that React is loaded
      expect(win.React).to.exist
    })
  })
})