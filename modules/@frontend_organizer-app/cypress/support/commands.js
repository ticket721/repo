import { user } from '../data/user';
import { loginResponse } from '../data/authResponse';

Cypress.Commands.add('login', () => {
    cy.server();
    cy.route('POST', 'authentication/local/login', loginResponse['200']).as('success');

    const { email, password, username } = user;

    cy.visit('/login');
    cy.get('input[name=email]').type(email);
    cy.get('input[name=password]').type(`${password}{enter}`);

    cy.url().should('be', '/');
})
