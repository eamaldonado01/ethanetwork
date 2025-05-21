it('logs in and shows feed', () => {
  cy.visit('/');
  cy.contains('Login').click();
  cy.origin('https://dev-ey2…auth0.com', () => {
    cy.get('input[name=email]').type(Cypress.env('AUTH0_EMAIL'));
    cy.get('input[name=password]').type(Cypress.env('AUTH0_PW'));
    cy.get('button[type=submit]').click();
  });
  cy.contains('Share something…');
});
