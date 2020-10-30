import { me } from '../data/user';
import { rightsResponse } from '../data/rightsResponse';
import { eventsResponse } from '../data/eventsResponse';
import { categoriesResponse, categoriesUpdate, globalCategoriesUpdate } from '../data/categoriesResponse';
import { datesResponse, avatar, dateResponseUpdate } from '../data/datesResponse';

const messages = {
    preview: 'User Preview',
    informations: 'Informations',
    categories: 'Categories',
    globalCategories: 'Global categories',
    generalInfo: 'General Informations',
    styles: 'Styles',
    location: 'Location',
    newCategory: '+ New category',
    newGlobalCategory: '+ New global category',
    success: 'Successfuly updated'
}

describe('Event Page Loads', () => {
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

        cy.get('button[name="Publish all dates"]').should('exist');
        cy.get('div > span').should('contain', eventsResponse.events[0].name);
        cy.get('div').should('contain', '30/07/2020 - 19:00'); // eventBegin date
        cy.get('button[name="Publish Date"]').should('exist');
        cy.get('button[name="Preview Event"]').should('exist');

        cy.get('div > span').contains(messages.informations).click();
        cy.get('div > span').contains(messages.generalInfo).should('exist');
        cy.get('div > span').contains(messages.styles).should('exist');
        cy.get('div > span').contains(messages.location).should('exist');

        cy.get('div > span').contains(messages.categories).click();
        cy.get('div > span').contains(categoriesResponse.categories[0].display_name).should('exist');
        cy.get('div > span').contains(messages.newCategory).should('exist');

        cy.get('div > span').contains(messages.globalCategories).click();
        cy.get('div > span').contains(categoriesResponse.categories[0].display_name).should('exist');
        cy.get('div > span').contains(messages.newGlobalCategory).should('exist');

    })

    it('general info loads', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/general-infos`);

        cy.get(`input[value="${eventsResponse.events[0].name}"]`).should('exist');
        cy.get('div > .editor').should('contain', datesResponse.dates[0].metadata.description);
        cy.get('div[id=tags]').within(($tags) => {
            datesResponse.dates[0].metadata.tags.forEach(tag => {
                cy.get('div').should('contain', tag);
            })
        });
        cy.get('button[name="Save Changes"]').should('be.disabled');
    })

    it('location loads', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/location`);

        cy.get(`input[value="${datesResponse.dates[0].location.location_label}"]`).should('exist');
        cy.get('button[name="Save Changes"]').should('be.disabled');
    })

    it('categories loads', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/category/${eventsResponse.events[0].categories[0]}`);
        cy.route('POST', 'events/search', eventsResponse).as('events-search');
        cy.route('POST', 'dates/search', datesResponse).as('dates-search');
        cy.route('POST', 'categories/search', categoriesResponse).as('categories-search');

        cy.get(`input[value="${categoriesResponse.categories[0].display_name}"]`).should('exist');
        cy.get(`input[value="${categoriesResponse.categories[0].prices[0].value / 100}"]`).should('exist');
        cy.get(`input[value="${categoriesResponse.categories[0].seats}"]`).should('exist');

        cy.get(`input[value="Mon, Jul 20th, 2020"]`).should('exist');
        cy.get(`input[value="Tue, Sep 29th, 2020"]`).should('exist');

        const displayTime = (date) => {
            let dateToFormat;
            if (typeof date === 'string') {
                dateToFormat = new Date(date);
            } else {
                dateToFormat = date;
            }
            const timeArray = dateToFormat.toLocaleTimeString().split(':');
            return `${timeArray[0]}:${timeArray[1]}`;
        };

        cy.get(`input[value="${displayTime(categoriesResponse.categories[0].sale_begin)}"]`).should('exist');
        cy.get(`input[value="${displayTime(categoriesResponse.categories[0].sale_end)}"]`).should('exist');

        cy.get('button[name="Save Changes"]').should('be.disabled');
        cy.get('button[name="Delete item"]').should('exist');
    })

    it('global categories loads', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/event/${eventsResponse.events[0].id}/category/${eventsResponse.events[0].categories[0]}`);
        cy.route('POST', 'events/search', eventsResponse).as('events-search');
        cy.route('POST', 'dates/search', datesResponse).as('dates-search');
        cy.route('POST', 'categories/search', categoriesResponse).as('categories-search');

        cy.get(`input[value="${categoriesResponse.categories[0].display_name}"]`).should('exist');
        cy.get(`input[value="${categoriesResponse.categories[0].prices[0].value / 100}"]`).should('exist');
        cy.get(`input[value="${categoriesResponse.categories[0].seats}"]`).should('exist');

        cy.get(`input[value="Mon, Jul 20th, 2020"]`).should('exist');
        cy.get(`input[value="Tue, Sep 29th, 2020"]`).should('exist');

        const displayTime = (date) => {
            let dateToFormat;
            if (typeof date === 'string') {
                dateToFormat = new Date(date);
            } else {
                dateToFormat = date;
            }
            const timeArray = dateToFormat.toLocaleTimeString().split(':');
            return `${timeArray[0]}:${timeArray[1]}`;
        };

        cy.get(`input[value="${displayTime(categoriesResponse.categories[0].sale_begin)}"]`).should('exist');
        cy.get(`input[value="${displayTime(categoriesResponse.categories[0].sale_end)}"]`).should('exist');

        cy.get('button[name="Save Changes"]').should('be.disabled');
        cy.get('button[name="Delete item"]').should('exist');
    })

})

describe('Event Page Update', () => {
    beforeEach(() => {
        cy.server();
        cy.login();
        cy.route('POST', 'rights/search', rightsResponse.event).as('event-right');
        cy.route('POST', 'events/search', eventsResponse).as('events-search');
        cy.route('POST', 'dates/search', datesResponse).as('dates-search');
        cy.route('POST', 'categories/search', categoriesResponse).as('categories-search');
        cy.route('GET', 'users/me', me).as('me');
    });
    it('update GeneralInfo', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/general-infos`);
        cy.route('PUT', `dates/${datesResponse.dates[0].id}`, dateResponseUpdate).as('update-generalInfo');

        cy.get(`input[value="${eventsResponse.events[0].name}"]`).type('{selectall}{del}COLDPLAY TOUR{enter}');
        cy.get('button[name="Save Changes"]').should('not.be.disabled').click();
    })
    it('update Location', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/location`);
        cy.route('PUT', `dates/${datesResponse.dates[0].id}`, dateResponseUpdate).as('update-location');

        cy.get(`input[value="${datesResponse.dates[0].location.location_label}"]`).type('{selectall}{del}Stade de France{downarrow}{enter}');
        cy.get('div').contains('Stade de France, Saint-Denis, France').click();
        cy.get('button[name="Save Changes"]').should('not.be.disabled').click();
    })
    it('update categories', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/category/${eventsResponse.events[0].categories[0]}`);
        cy.route('PUT', `categories/undefined`, categoriesUpdate).as('update-categories');

        cy.get(`input[name="name"]`).type('{selectall}{del}SUPER VIP{enter}');
        cy.get('button[name="Save Changes"]').should('not.be.disabled').click();
    })
    it('update global categories', () => {
        cy.visit(`/group/${eventsResponse.events[0].id}/event/${eventsResponse.events[0].id}/category/${eventsResponse.events[0].categories[0]}`);
        cy.route('PUT', `categories/undefined`, categoriesUpdate).as('update-categories');

        cy.get(`input[value="${categoriesResponse.categories[0].seats}"]`).type('{selectall}{del}500{enter}');

        cy.get('button[name="Save Changes"]').should('not.be.disabled').click();
    })
    // it('create category', () => {
    //     cy.visit(`/group/${eventsResponse.events[0].id}/date/${eventsResponse.events[0].dates[0]}/category`);
    //
    //     cy.get('input[id="name"]').type('Classic');
    //     cy.get('input[id="price"]').type('{selectall}{del}80');
    //     cy.get('input[id="seats"]').type('230');
    //
    //     cy.get('input[id="saleDateBegin"]').focus();
    //     cy.get('input[aria-label="Choose Tuesday, August 25th, 2020"]').click();
    //     cy.get('input[id="saleDateEnd"]').focus();
    //     cy.get('input[aria-label="Choose Tuesday, September 1st, 2020"]').should('exist');
    //
    //     cy.get('button[name="Save Changes"]').click();
    //     cy.contains('.Toastify__toast', messages.success);
    // })
})
