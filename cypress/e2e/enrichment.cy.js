describe('mocked enrichment flow', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
    cy.mockEnrichResponse('enrich-au.json');
    cy.mockBusinessIdResponse('/api/abn', 'abn-au.json');
  });

  it('enriches a lead with mocked OpenAI and ABN responses', () => {
    cy.login();
    cy.visit('/au');

    cy.get('[data-cy="lead-row"]').should('contain', 'Fixture Buyers Agency AU');
    cy.get('[data-cy="enrich-all-button"]').click();

    cy.wait('@enrich').its('request.body').should((body) => {
      expect(body).to.include({
        website: 'https://example.test/fixture-buyers-au',
        businessName: 'Fixture Buyers Agency AU',
      });
    });
    cy.wait('@businessIdLookup').its('request.body').should('deep.equal', {
      businessName: 'Fixture Buyers Agency AU',
    });

    cy.get('[data-cy="enrichment-summary"]').should('contain', '1 leads enriched');
    cy.get('[data-cy="lead-row"]')
      .should('contain', 'Taylor Cypress')
      .and('contain', 'taylor@example.test');
  });
});
