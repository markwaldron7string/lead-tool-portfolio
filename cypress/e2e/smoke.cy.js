describe('login smoke test', () => {
  it('renders the login page', () => {
    cy.visit('/login');

    cy.get('[data-cy="login-title"]', { timeout: 10000 }).should('be.visible').and('contain', 'Lead Scraper');
    cy.get('[data-cy="login-form"]').should('be.visible').and('contain', 'Password required');
    cy.get('[data-cy="password-input"]')
      .should('be.visible')
      .and('have.attr', 'type', 'password');
    cy.get('[data-cy="login-submit"]').should('be.visible').and('be.disabled');
  });
});
