import { user } from '../data/user';
import { loginResponse } from '../data/authResponse';
import {rightsResponse} from "../data/rightsResponse";
import {eventsResponse} from "../data/eventsResponse";
import {datesResponse} from "../data/datesResponse";
import {categoriesResponse} from "../data/categoriesResponse";

Cypress.Commands.add('login', () => {
    cy.server();
    cy.route('POST', 'authentication/local/login', loginResponse['200']).as('success');

    const { email, password, username } = user;

    cy.visit('/login');
    cy.get('input[name=email]').type(email);
    cy.get('input[name=password]').type(`${password}{enter}`);

    cy.url().should('be', '/');
});

Cypress.Commands.add('fetchEvent', () => {
    cy.server();
    cy.route('POST', 'rights/search', rightsResponse.event).as('event-right');
    cy.route('POST', 'events/search', eventsResponse).as('events-search');
    cy.route('POST', 'dates/search', datesResponse).as('dates-search');
    cy.route('POST', 'categories/search', categoriesResponse).as('categories-search');

    cy.wait('@events-search').then(xhrE => {
        cy.wait('@dates-search').then(xhrD => {
            cy.wait('@categories-search').then(xhrC => {
                cy.get('span').contains(eventsResponse.events[0].name).click();
            });
        });
    });
    cy.url().should('be', `group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}`);
});
