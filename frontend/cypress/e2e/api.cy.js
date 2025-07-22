describe('API Integration Tests', () => {
  const testClient = 'Cypress Test Client';

  beforeEach(() => {
    cy.checkApiHealth();
  });

  it('should have a healthy API endpoint', () => {
    cy.request(`${Cypress.env('apiUrl')}/health`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('healthy');
        expect(response.body.database).to.eq('connected');
      });
  });

  it('should handle root endpoint', () => {
    cy.request(`${Cypress.env('apiUrl')}/`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq('Hello World');
      });
  });

  it('should create and retrieve status checks', () => {
    // Create a status check
    cy.createStatusCheck(testClient)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.client_name).to.eq(testClient);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('timestamp');
        
        const createdId = response.body.id;

        // Get all status checks and verify our created one exists
        cy.getStatusChecks()
          .then((getResponse) => {
            expect(getResponse.status).to.eq(200);
            expect(getResponse.body).to.be.an('array');
            
            const foundClient = getResponse.body.find(
              item => item.id === createdId
            );
            
            expect(foundClient).to.exist;
            expect(foundClient.client_name).to.eq(testClient);
          });
      });
  });

  it('should handle multiple status checks', () => {
    const clients = ['Client 1', 'Client 2', 'Client 3'];
    const createdIds = [];

    // Create multiple status checks
    clients.forEach((client) => {
      cy.createStatusCheck(client)
        .then((response) => {
          expect(response.status).to.eq(200);
          createdIds.push(response.body.id);
        });
    });

    // Verify all were created
    cy.getStatusChecks()
      .then((response) => {
        expect(response.status).to.eq(200);
        const statusChecks = response.body;
        
        clients.forEach((client) => {
          const found = statusChecks.find(sc => sc.client_name === client);
          expect(found).to.exist;
        });
      });
  });

  it('should validate status check data structure', () => {
    cy.createStatusCheck(testClient)
      .then((response) => {
        const statusCheck = response.body;
        
        // Validate required fields exist
        expect(statusCheck).to.have.property('id');
        expect(statusCheck).to.have.property('client_name');
        expect(statusCheck).to.have.property('timestamp');
        
        // Validate data types
        expect(statusCheck.id).to.be.a('string');
        expect(statusCheck.client_name).to.be.a('string');
        expect(statusCheck.timestamp).to.be.a('string');
        
        // Validate timestamp format (ISO string)
        expect(new Date(statusCheck.timestamp).toISOString()).to.eq(statusCheck.timestamp);
      });
  });
});