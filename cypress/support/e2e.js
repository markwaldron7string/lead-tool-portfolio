const paidApiRoutes = [
  '/api/scrape',
  '/api/enrich',
  '/api/research',
  '/api/abn',
  '/api/nzbn',
];

Cypress.Commands.add('login', () => {
  // No auth gate in this version — pages load directly. No-op for compatibility.
  cy.log('No auth gate — login is a no-op');
});

Cypress.Commands.add('blockUnmockedPaidApis', () => {
  paidApiRoutes.forEach((route) => {
    cy.intercept('POST', route, (req) => {
      req.reply({
        statusCode: 503,
        body: { error: `Blocked unmocked paid API route in Cypress: ${route}` },
      });
    });
  });
});

Cypress.Commands.add('mockLeadCsv', (route, fixture) => {
  cy.intercept('GET', route, {
    statusCode: 200,
    headers: { 'Content-Type': 'text/csv' },
    fixture,
  });
});

Cypress.Commands.add('mockScrapeResponse', (fixture = 'scrape-au.json') => {
  cy.intercept('POST', '/api/scrape', {
    statusCode: 200,
    fixture,
  }).as('scrape');
});

Cypress.Commands.add('mockEnrichResponse', (fixture = 'enrich-au.json') => {
  cy.intercept('POST', '/api/enrich', {
    statusCode: 200,
    fixture,
  }).as('enrich');
});

Cypress.Commands.add('mockBusinessIdResponse', (route, fixture) => {
  cy.intercept('POST', route, {
    statusCode: 200,
    fixture,
  }).as('businessIdLookup');
});
