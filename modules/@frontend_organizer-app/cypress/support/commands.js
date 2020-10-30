import {me, user} from '../data/user';
import { loginResponse } from '../data/authResponse';
import {rightsResponse} from "../data/rightsResponse";
import {eventsResponse} from "../data/eventsResponse";
import {datesResponse} from "../data/datesResponse";
import {categoriesResponse} from "../data/categoriesResponse";

Cypress.Commands.add('login', () => {
    cy.server();
    cy.route('POST', 'authentication/local/login', loginResponse['200']).as('success');
    cy.route('GET', 'users/me', me).as('me');

    const { email, password } = user;

    cy.visit('/login');
    cy.get('input[name=email]').type(email);
    cy.get('input[name=password]').type(`${password}{enter}`);

    cy.url().should('be', '/');
});
