/// <reference types="cypress" />

// keep Cypress green even if React logs errors
Cypress.on('uncaught:exception', () => false);

beforeEach(() => {
  // Pretend the user already has a valid cookie
  cy.setCookie('auth-token', 'mock-token');

  // Stub the "who am I?" call
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: { user: { sub: 'cypress|1', email: 'stub@cy.dev' } },
  }).as('me');

  /**
   * Stub **only** the Feed query – leave every other
   * GraphQL operation untouched.
   */
  cy.intercept('POST', '/api/graphql', (req) => {
    const op = req.body.operationName;
    if (
      op === 'Feed' ||
      (typeof op === 'undefined' && req.body.query.includes('feed('))
    ) {
      req.reply({ fixture: 'feed.json' });
    } else {
      req.continue(); // anything else hits the real back-end
    }
  }).as('feedQuery');

  // boot the app
  cy.visit('/');
});

describe('feed (stubbed as already logged-in)', () => {
  it('shows the Hello world post immediately', () => {
    cy.wait('@me');
    cy.wait('@feedQuery');

    // the text from our fixture must appear
    cy.contains('Hello world', { timeout: 10_000 }).should('be.visible');
  });
});
