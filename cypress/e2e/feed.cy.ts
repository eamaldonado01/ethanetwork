/// <reference types="cypress" />

// prevent uncaught exceptions from your app
Cypress.on('uncaught:exception', () => false);

const AUTH0_DOMAIN = 'dev-ey2vz7x2wgqr0b3d.us.auth0.com';
const EMAIL = 'cypress@example.com';
const PW = 'Test1234!';

describe('full Auth0+feed flow', () => {
  it('logs in and sees the feed', () => {
    // 0️⃣ stub the feed GraphQL response
    cy.intercept('POST', '/api/graphql', (req) => {
      if (req.body.query.includes('feed(')) {
        req.reply({ fixture: 'feed.json' });
      }
    }).as('feedQuery');

    // 1️⃣ visit home + click login
    cy.visit('/');
    cy.contains('Login').click();

    // 2️⃣ authenticate on Auth0
    cy.origin(
      AUTH0_DOMAIN,
      { args: { email: EMAIL, pw: PW } },
      ({ email, pw }) => {
        cy.get('input[name=email]', { timeout: 10000 }).type(email);
        cy.get('input[name=password]').type(pw);
        cy.get('button[type=submit]').click();
      },
    );

    // 3️⃣ back in app, wait for stubbed feedQuery and assert
    cy.wait('@feedQuery');
    cy.contains('Hello world', { timeout: 10000 });
  });
});
