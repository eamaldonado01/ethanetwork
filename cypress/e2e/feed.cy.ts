/// <reference types="cypress" />

// Don’t fail the test on React warnings etc.
Cypress.on('uncaught:exception', () => false);

describe('feed (stubbed as already logged in)', () => {
  beforeEach(() => {
    // Fake an Auth0 session cookie (any value is fine for the stub)
    cy.setCookie('auth-token', 'mock-token');

    // Stub GET /api/auth/me  →  authenticated user
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: { email: 'cypress@example.com', name: 'Cypress Tester' },
    }).as('me');

    // Always stub the Feed GraphQL query with our fixture
    cy.intercept('POST', '/api/graphql', { fixture: 'feed.json' }).as(
      'feedQuery',
    );
  });

  it('shows the Hello world post immediately', () => {
    cy.visit('/');

    // Ensure both stubs have completed
    cy.wait(['@me', '@feedQuery']);

    // The post from the fixture should now be on screen
    cy.contains('Hello world').should('be.visible');
  });
});
