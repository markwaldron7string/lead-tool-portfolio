describe('mocked scraping flow', () => {
  beforeEach(() => {
    cy.blockUnmockedPaidApis();
    cy.mockLeadCsv('/leads_au.csv', 'leads-empty.csv');
    cy.mockScrapeResponse('scrape-au.json');
  });

  it('adds mocked scrape results without hitting Google Places', () => {
    cy.login();
    cy.visit('/au');

    cy.get('[data-cy="empty-leads-message"]').should('contain', 'No leads yet');
    cy.get('[data-cy="scrape-button"]').click();

    cy.wait('@scrape').its('request.body').should((body) => {
      expect(body).to.include({
        searchTerm: 'buyers agent',
        country: 'AU',
      });
      expect(body.city).to.be.a('string').and.not.be.empty;
    });

    cy.get('[data-cy="leads-page-title"]').should('contain', 'Australia');
    cy.get('[data-cy="leads-table"]').should('contain', 'Cypress Buyers Agency');
    cy.get('[data-cy="lead-row"]')
      .should('contain', 'Cypress Buyers Agency')
      .and('contain', '+61 2 5550 0199');
  });
});
