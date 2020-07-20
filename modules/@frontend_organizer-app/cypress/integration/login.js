import { user } from '../utils/data';
import {loginResponse, registerResponse} from '../utils/authResponse';

const messages = {
    wrongCredentials: 'wrong email or password',
    invalidEmail: 'email must be a valid email',
    requiredEmail: 'email is required',
    requiredPassword: 'password is required',
    register: 'First time using the app ? Register here !'
}

describe('Login', () => {
    beforeEach(() => {
        cy.server();
    });
    it('successfully loads', () => {
        cy.visit('/login')
        cy.get('input[name=email]').should('exist');
        cy.get('input[name=password]').should('exist');
        cy.get('button[name=Login]').should('exist');
    })
    it('visit register', function () {
        cy.visit('/login');

        cy.get('form > div > span').contains(messages.register).click();

        cy.url().should('be', '/register');
        cy.get('input[name=email]').should('exist');
        cy.get('input[name=password]').should('exist');
        cy.get('input[name=username]').should('exist');
        cy.get('button[name=Register]').should('exist');
    })

    it('invalid credentials', function () {
        cy.route('POST', 'authentication/local/login', loginResponse["401"]).as('error');
        cy.visit('/login');

        const { password } = user;
        cy.get('input[name=email]').type(`${password}@gmail.com`);
        cy.get('input[name=password]').type(`${password}{enter}`);

        cy.wait('@error').then((xhr) => {
            cy.url().should('be', '/login');
            expect(xhr.response.body.message).to.equal(xhr.response.body.message, loginResponse["401"].message);
        });
    })
    it('success login', function () {
        cy.route('POST', 'authentication/local/login', loginResponse["200"]).as('success');
        cy.visit('/login');

        const { email, password, username } = user;

        cy.get('input[name=email]').type(email);
        cy.get('input[name=password]').type(`${password}{enter}`);

        cy.url().should('be', '/');
        cy.get('h3').should('contain', username);
    })

    it('invalid email format', function () {
        cy.visit('/login');

        const { password } = user;
        cy.get('input[name=email]').type(`${password}{enter}`);

        cy.url().should('be', '/login');
        cy.get('span').should('contain', messages.invalidEmail);
    })
    it('email required', function () {
        cy.visit('/login');

        cy.get('input[name=email]').type('{enter}')

        cy.url().should('be', '/login')
        cy.get('span').should('contain', messages.requiredEmail);
    })
    it('password required', function () {
        cy.visit('/login');

        cy.get('input[name=password]').type('{enter}')

        cy.url().should('be', '/login')
        cy.get('span').should('contain', messages.requiredPassword);
    })
    it('fields required', function () {
        cy.visit('/login');

        cy.get('input[name=email]').type('{enter}')
        cy.get('input[name=password]').type('{enter}')

        cy.url().should('be', '/login')
        cy.get('span').should('contain', messages.requiredEmail);
        cy.get('span').should('contain', messages.requiredPassword);
    })
})
