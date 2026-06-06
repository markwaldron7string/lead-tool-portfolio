describe('auth and protected routing', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
  });

  it('redirects unauthenticated users to the login page', () => {
    cy.visit('/', { failOnStatusCode: false });

    cy.location('pathname').should('eq', '/login');
    cy.location('search').should('include', 'from=%2F');
    cy.get('[data-cy="login-form"]').should('be.visible');
  });

  it('loads the country selector after server-side login', () => {
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
    cy.mockLeadCsv('/leads_nz.csv', 'leads-nz-single.csv');

    cy.login();
    cy.visit('/');

    cy.get('[data-cy="home-title"]').should('contain', 'Select Country');
    cy.get('[data-cy="country-card-au"]').should('be.visible').and('contain', 'Australia');
    cy.get('[data-cy="country-card-nz"]').should('be.visible').and('contain', 'New Zealand');
  });

  it('loads AU and NZ lead dashboards after server-side login', () => {
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
    cy.mockLeadCsv('/leads_nz.csv', 'leads-nz-single.csv');

    cy.login();
    cy.visit('/au');
    cy.get('[data-cy="leads-page-title"]').should('contain', 'Australia');
    cy.get('[data-cy="lead-row"]').should('contain', 'Fixture Buyers Agency AU');

    cy.visit('/nz');
    cy.get('[data-cy="leads-page-title"]').should('contain', 'New Zealand');
    cy.get('[data-cy="lead-row"]').should('contain', 'Fixture Buyers Agency NZ');
  });
});
