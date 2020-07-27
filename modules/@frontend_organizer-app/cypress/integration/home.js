import { me, user } from '../data/user';
import { rightsResponse } from '../data/rightsResponse';
import { eventsResponse } from '../data/eventsResponse';
import { categoriesResponse } from '../data/categoriesResponse';
import { datesResponse } from '../data/datesResponse';

const messages = {
    noEvent: 'You don\'t have any event yet',
    createEvent: 'Create Event',
    generalInformation: 'General informations',
}

describe('Login', () => {
    beforeEach(() => {
        cy.server();
        cy.route('GET', 'users/me', me).as('me');
        cy.login();
        cy.visit('/');
    });
    it('successfully loads', () => {
        cy.get('.t721-icons-t721').should('exist');
        cy.get('div > a').should('contain', messages.createEvent);
        cy.get('div > section > div > h3').should('contain', user.username);
    })
    it('visit create-event', () => {
        cy.get('div > a').contains(messages.createEvent).click();

        cy.url().should('be', '/create-event');
    })
    it('open drawer', () => {
        cy.get('div > section > div > h3').contains(user.username).click();

        cy.url().should('be', '/create-event?profile=root');
    })

    it('no events', () => {
        cy.route('POST', 'rights/search', rightsResponse.none).as('no-event');
        cy.wait('@no-event').then(xhr => {
            cy.get('div > span').should('contain', messages.noEvent);
        });
    })
    it('load events', () => {
        cy.route('POST', 'rights/search', rightsResponse.event).as('event-right');
        cy.route('POST', 'events/search', eventsResponse).as('events-search');
        cy.route('POST', 'dates/search', datesResponse).as('dates-search');
        cy.route('POST', 'categories/search', categoriesResponse).as('categories-search');

        cy.wait('@events-search').then(xhrE => {
            cy.wait('@dates-search').then(xhrD => {
                cy.wait('@categories-search').then(xhrC => {
                    cy.get('span').should('contain', `${categoriesResponse.categories[0].seats} remaining tickets`);
                    cy.get('span').should('contain', `${categoriesResponse.categories[0].prices[0].value / 100} €`);
                    cy.get('span').should('contain', eventsResponse.events[0].name);
                });
            });
        });
    })
})
