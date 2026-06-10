describe('mocked scraping flow', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
    cy.mockLeadCsv('/leads_au.csv', 'leads-empty.csv');
    cy.mockScrapeResponse('scrape-au.json');
  });

  it('shows a demo notice instead of scraping on the portfolio site', () => {
    cy.visit('/au');

    cy.get('[data-cy="empty-leads-message"]').should('contain', 'No leads yet');
    cy.get('[data-cy="scrape-button"]').click();

    cy.get('[data-cy="demo-notice"]').should('be.visible');
    cy.get('[data-cy="demo-notice"]').should('contain', 'Scraping disabled on this demo site');
    cy.get('[data-cy="lead-row"]').should('not.exist');
  });
});
