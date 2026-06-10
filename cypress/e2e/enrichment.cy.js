describe('mocked enrichment flow', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
    cy.mockEnrichResponse('enrich-au.json');
    cy.mockBusinessIdResponse('/api/abn', 'abn-au.json');
  });

  it('shows a demo notice instead of enriching on the portfolio site', () => {
    cy.visit('/au');

    cy.get('[data-cy="lead-row"]').should('contain', 'Fixture Buyers Agency AU');
    cy.get('[data-cy="enrich-all-button"]').click();

    cy.get('[data-cy="demo-notice"]').should('be.visible');
    cy.get('[data-cy="demo-notice"]').should('contain', 'Enrichment disabled on this demo site');
    cy.get('[data-cy="lead-row"]').should('not.contain', 'Taylor Cypress');
  });
});
