import { me, user } from '../data/user';
import { rightsResponse, actionResponse } from '../data/rightsResponse';

describe('Create Event', () => {
    beforeEach(() => {
        cy.server();
        cy.route('GET', 'users/me', me).as('me');
        cy.route('POST', 'rights/search', rightsResponse.event).as('event-right');
        cy.route('POST', 'actions/search', actionResponse).as('action-search');

        cy.login();
        cy.visit('/create-event');
    });
    it('create event', () => {
        cy.get('input[name=name]').type('super event');
        cy.get('div .editor').type('super event description');
        // cy.get('div[id=tags]').focus();
        // cy.get('input[name=tags]').type('super{enter}event{enter}tag{enter}');
    })
})
