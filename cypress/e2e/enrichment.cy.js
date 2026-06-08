describe('enrichment in demo mode', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
  });

  it('shows the enrichment bar but enrichment is disabled in demo mode', () => {
    cy.visit('/au');

    // Enrichment bar is visible and shows the default description
    cy.get('[data-cy="enrichment-bar"]').should('be.visible');
    cy.get('[data-cy="enrichment-summary"]')
      .should('be.visible')
      .and('contain', 'Extracts contact info');

    // In demo mode the "Enrich all leads" button is wrapped in DemoDisabled
    // - it renders without data-cy and is not clickable
    cy.get('[data-cy="enrich-all-button"]').should('not.exist');

    // Per-lead enrich and research buttons are also replaced by DemoDisabled
    cy.get('[data-cy="lead-row"]').should('contain', 'Fixture Buyers Agency AU');
    cy.get('[data-cy="lead-enrich-button"]').should('not.exist');
    cy.get('[data-cy="lead-research-button"]').should('not.exist');
  });
});
