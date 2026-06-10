describe('app smoke test', () => {
  it('renders the home page', () => {
    cy.visit('/');

    cy.get('[data-cy="home-title"]', { timeout: 10000 }).should('be.visible').and('contain', 'Select Country');
    cy.get('[data-cy="country-card-au"]').should('be.visible');
    cy.get('[data-cy="country-card-nz"]').should('be.visible');
  });
});
