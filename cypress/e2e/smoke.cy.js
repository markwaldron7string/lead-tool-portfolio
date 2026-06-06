describe('demo mode smoke tests', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
  });

  it('renders the home page with both country cards', () => {
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
    cy.mockLeadCsv('/leads_nz.csv', 'leads-nz-single.csv');

    cy.visit('/');

    cy.get('[data-cy="home-title"]').should('be.visible').and('contain', 'Select Country');
    cy.get('[data-cy="country-card-au"]').should('be.visible').and('contain', 'Australia');
    cy.get('[data-cy="country-card-nz"]').should('be.visible').and('contain', 'New Zealand');
  });

  it('AU dashboard loads with sample leads and stat cards', () => {
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');

    cy.visit('/au');

    cy.get('[data-cy="leads-page-title"]').should('contain', 'Australia');
    cy.get('[data-cy="stat-unique-leads"]').should('be.visible');
    cy.get('[data-cy="leads-table"]').should('be.visible');
    cy.get('[data-cy="lead-row"]')
      .should('have.length.at.least', 1)
      .and('contain', 'Fixture Buyers Agency AU');
  });

  it('NZ dashboard loads with sample leads', () => {
    cy.mockLeadCsv('/leads_nz.csv', 'leads-nz-single.csv');

    cy.visit('/nz');

    cy.get('[data-cy="leads-page-title"]').should('contain', 'New Zealand');
    cy.get('[data-cy="leads-table"]').should('be.visible');
    cy.get('[data-cy="lead-row"]')
      .should('have.length.at.least', 1)
      .and('contain', 'Fixture Buyers Agency NZ');
  });
});
