describe('Application E2E Tests', () => {
  beforeEach(() => {
    // Check that API is healthy before running tests
    cy.checkApiHealth();
  });

  it('should load the application successfully', () => {
    cy.waitForApp();
    
    // Check that the app has loaded
    cy.get('body').should('be.visible');
    
    // Check that we can see some content (adjust selector based on your app)
    cy.get('*').should('have.length.greaterThan', 0);
  });

  it('should be able to interact with the API', () => {
    // Create a test status check
    cy.createStatusCheck('E2E Test Client').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('client_name', 'E2E Test Client');
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('timestamp');
    });

    // Get all status checks
    cy.getStatusChecks().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      // Should find our test client
      const testClient = response.body.find(item => 
        item.client_name === 'E2E Test Client'
      );
      expect(testClient).to.exist;
    });
  });

  it('should handle navigation properly', () => {
    cy.waitForApp();
    
    // Test that the app handles routes correctly
    // This will depend on your specific routing setup
    cy.url().should('include', '/');
    
    // If you have additional routes, test them
    // cy.visit('/some-route');
    // cy.url().should('include', '/some-route');
  });

  it('should be responsive', () => {
    cy.waitForApp();
    
    // Test different viewport sizes
    cy.viewport(1920, 1080); // Desktop
    cy.get('body').should('be.visible');
    
    cy.viewport(768, 1024); // Tablet
    cy.get('body').should('be.visible');
    
    cy.viewport(375, 667); // Mobile
    cy.get('body').should('be.visible');
  });
});