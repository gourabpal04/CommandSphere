describe('CommandSphere API E2E Tests', () => {
  const testClient = `test-client-${Date.now()}`
  
  before(() => {
    // Check if backend is available before running tests
    cy.checkApiHealth()
  })

  describe('Health Check Endpoint', () => {
    it('should return healthy status with database connection', () => {
      cy.checkApiHealth()
    })

    it('should return proper response structure', () => {
      cy.request('GET', `${Cypress.env('apiUrl')}/health`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.keys(['status', 'database'])
        expect(response.body.status).to.be.oneOf(['healthy', 'unhealthy'])
        expect(response.body.database).to.be.oneOf(['connected', 'disconnected'])
      })
    })
  })

  describe('Root API Endpoint', () => {
    it('should return hello world message', () => {
      cy.request('GET', `${Cypress.env('apiUrl')}/`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('message', 'Hello World')
      })
    })
  })

  describe('Status Check CRUD Operations', () => {
    it('should create a new status check', () => {
      cy.createStatusCheck(testClient).then((statusCheck) => {
        expect(statusCheck).to.have.property('id')
        expect(statusCheck).to.have.property('client_name', testClient)
        expect(statusCheck).to.have.property('timestamp')
        
        // Verify timestamp is a valid date
        const timestamp = new Date(statusCheck.timestamp)
        expect(timestamp.getTime()).to.be.a('number')
        expect(timestamp.getTime()).to.be.greaterThan(Date.now() - 60000) // Within last minute
      })
    })

    it('should retrieve all status checks', () => {
      // First create a status check
      cy.createStatusCheck(testClient)
      
      // Then retrieve all status checks
      cy.getStatusChecks().then((statusChecks) => {
        expect(statusChecks).to.be.an('array')
        expect(statusChecks.length).to.be.greaterThan(0)
        
        // Check structure of status check objects
        const firstCheck = statusChecks[0]
        expect(firstCheck).to.have.property('id')
        expect(firstCheck).to.have.property('client_name')
        expect(firstCheck).to.have.property('timestamp')
      })
    })

    it('should handle invalid status check creation', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/status`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(422) // Validation error
      })
    })

    it('should persist status checks across requests', () => {
      const uniqueClient = `persistent-test-${Date.now()}`
      
      // Create status check
      cy.createStatusCheck(uniqueClient)
      
      // Retrieve and verify it exists
      cy.getStatusChecks().then((statusChecks) => {
        const foundCheck = statusChecks.find(check => check.client_name === uniqueClient)
        expect(foundCheck).to.exist
        expect(foundCheck.client_name).to.eq(uniqueClient)
      })
    })
  })

  describe('API Error Handling', () => {
    it('should handle non-existent endpoints gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/non-existent-endpoint`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
      })
    })

    it('should handle invalid HTTP methods', () => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/status`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(405) // Method not allowed
      })
    })
  })

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', () => {
      cy.request({
        method: 'OPTIONS',
        url: `${Cypress.env('apiUrl')}/status`,
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204])
        expect(response.headers).to.have.property('access-control-allow-origin')
      })
    })
  })
})