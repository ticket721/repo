import { me, user } from '../data/user';
import { rightsResponse } from '../data/rightsResponse';
import { eventsResponse } from '../data/eventsResponse';
import { categoriesResponse } from '../data/categoriesResponse';
import { datesResponse } from '../data/datesResponse';

const messages = {
    preview: 'User Preview',
}

describe('Event Page', () => {
    beforeEach(() => {
        cy.server();
        cy.route('GET', 'users/me', me).as('me');
        cy.login();
        cy.fetchEvent();
    });
    it('successfully loads', () => {
        cy.get('h2').should('contain', eventsResponse.events[0].name);
        cy.get('span').should('contain', messages.preview);
    })
})
