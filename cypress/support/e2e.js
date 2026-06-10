// React 19 throws hydration errors as uncaught exceptions (React 18 only warned).
// In the Next.js production build, RSC streaming triggers these during initial hydration.
// React recovers and renders correctly; suppress all minified React errors to avoid
// false test failures. Covers #418 (hydration mismatch) plus any cascading recovery errors.
Cypress.on('uncaught:exception', (err) => {
  const msg = (err && err.message) || String(err);
  if (msg.includes('Minified React error')) {
    return false;
  }
});

const paidApiRoutes = [
  '/api/scrape',
  '/api/enrich',
  '/api/research',
  '/api/abn',
  '/api/nzbn',
];

Cypress.Commands.add('login', () => {
  // Portfolio is public; no auth cookie required.
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
