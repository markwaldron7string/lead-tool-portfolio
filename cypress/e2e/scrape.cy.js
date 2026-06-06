describe('scrape panel in demo mode', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
    cy.mockLeadCsv('/leads_au.csv', 'leads-au-single.csv');
  });

  it('shows the scrape panel but scraping is disabled in demo mode', () => {
    cy.visit('/au');

    // Scrape panel header is always visible on the leads dashboard
    cy.get('[data-cy="scrape-panel"]').should('be.visible');

    // Panel can be toggled open to reveal its controls
    cy.get('[data-cy="scrape-panel-toggle"]').click();
    cy.get('[data-cy="search-term-select"]').should('be.visible');
    cy.get('[data-cy="area-select"]').should('be.visible');
    cy.get('[data-cy="all-areas-button"]').should('be.visible');

    // In demo mode the scrape and run-all-terms buttons are wrapped in
    // DemoDisabled — they render without data-cy and are not clickable
    cy.get('[data-cy="scrape-button"]').should('not.exist');
    cy.get('[data-cy="run-all-terms-button"]').should('not.exist');
  });
});
