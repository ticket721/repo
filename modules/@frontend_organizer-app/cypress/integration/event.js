import { me } from '../data/user';
import { rightsResponse } from '../data/rightsResponse';
import { eventsResponse } from '../data/eventsResponse';
import { categoriesResponse } from '../data/categoriesResponse';
import { datesResponse, avatar } from '../data/datesResponse';

const messages = {
    preview: 'User Preview',
}

describe('Event Page', () => {
    beforeEach(() => {
        cy.server();
        cy.login();
        cy.route('POST', 'rights/search', rightsResponse.event).as('event-right');
        cy.route('POST', 'events/search', eventsResponse).as('events-search');
        cy.route('POST', 'dates/search', datesResponse).as('dates-search');
        cy.route('POST', 'categories/search', categoriesResponse).as('categories-search');
        cy.route('GET', 'users/me', me).as('me');
    });
    it('successfully loads', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}`);
        cy.get('h2').should('contain', eventsResponse.events[0].name);
        cy.get('span').should('contain', messages.preview);
    })

    it('general info loads', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/general-infos`);

        cy.get(`input[value="${eventsResponse.events[0].name}"]`).should('exist');
        cy.get('textarea[name=description]').should('contain', datesResponse.dates[0].metadata.description);
        cy.get('div[id=tags]').within(($tags) => {
            datesResponse.dates[0].metadata.tags.forEach(tag => {
                cy.get('div').should('contain', tag);
            })
        });
        cy.get('button[name="Save Changes"]').should('be.disabled');
    })

    // it('styles loads', () => {
    //     cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/styles`);
    //
    //     cy.route('GET', `static/${datesResponse.dates[0].metadata.avatar}`, avatar).as('get-avatar');
    //     cy.get('span').contains(datesResponse.dates[0].metadata.signature_colors[0]);
    //     cy.get('span').contains(datesResponse.dates[0].metadata.signature_colors[1]);
    //     cy.get('button[name="Save Changes"]').should('be.disabled');
    // })

    it('location loads', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/location`);

        cy.get(`input[value="${datesResponse.dates[0].location.location_label}"]`).should('exist');
        cy.get('button[name="Save Changes"]').should('be.disabled');
    })

})
