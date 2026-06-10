describe('portfolio public access', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
  });

  it('loads the country selector without requiring login', () => {
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
    cy.mockLeadCsv('/leads_nz.csv', 'leads-nz-single.csv');

    cy.visit('/');

    cy.location('pathname').should('eq', '/');
    cy.get('[data-cy="home-title"]').should('contain', 'Select Country');
    cy.get('[data-cy="country-card-au"]').should('be.visible').and('contain', 'Australia');
    cy.get('[data-cy="country-card-nz"]').should('be.visible').and('contain', 'New Zealand');
  });

  it('redirects /login to the home page', () => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.location('pathname').should('eq', '/');
  });

  it('loads AU and NZ lead dashboards without authentication', () => {
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
    cy.mockLeadCsv('/leads_nz.csv', 'leads-nz-single.csv');

    cy.visit('/au');
    cy.get('[data-cy="leads-page-title"]').should('contain', 'Australia');
    cy.get('[data-cy="lead-row"]').should('contain', 'Fixture Buyers Agency AU');

    cy.visit('/nz');
    cy.get('[data-cy="leads-page-title"]').should('contain', 'New Zealand');
    cy.get('[data-cy="lead-row"]').should('contain', 'Fixture Buyers Agency NZ');
  });
});
