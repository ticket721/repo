import { user } from '../data/user';
import { registerResponse } from '../data/authResponse';

const messages = {
    invalidEmail: 'email must be a valid email',
    requiredEmail: 'email is required',
    usedEmail: 'this email is already in use',

    requiredUsername: 'username is required',
    shortUsername: 'username is too short (min. 4 characters)',
    longUsername: 'username is too long (max. 20 characters)',
    usedUsername: 'this username is already in use',

    requiredPassword: 'password is required',
    repeatedPassword: 'Sequences like abc or 6543 are easy to guess',
    shortPassword: 'Add another word or two. Uncommon words are better.',
    straightRow: 'Straight rows of keys are easy to guess',

    login: 'Already registered ? Login here !',
    success: 'successfully registered',
    emailSent: 'We sent you a validation email !',
}

describe('Register', () => {
    beforeEach(() => {
        cy.server();
        cy.visit('/register');
    });
    it('successfully loads', () => {
        cy.get('input[name=email]').should('exist');
        cy.get('input[name=password]').should('exist');
        cy.get('input[name=username]').should('exist');
        cy.get('button[name=Register]').should('exist');
    })
    it('visit login', function () {
        cy.get('form > div > span').contains(messages.login).click();

        cy.url().should('be', '/login');
        cy.get('input[name=email]').should('exist');
        cy.get('input[name=password]').should('exist');
        cy.get('button[name=Login]').should('exist');
    })

    it('create a user (confirm email page)', function () {
        cy.route('POST', 'authentication/local/register', registerResponse["201"]).as('create user');

        const { email, username, password } = user;

        cy.get('input[name=email]').type(email);
        cy.get('input[name=username]').type(username);
        cy.get('input[name=password]').type(`${password}{enter}`);

        cy.url().should('be', '/');
        cy.get('span').should('contain', messages.emailSent);
        cy.contains('.Toastify__toast', messages.success);
    })
    it('create a user (with valid email)', function () {
        cy.route('POST', 'authentication/local/register', registerResponse["201_validEmail"]).as('create user');

        const { email, username, password } = user;

        cy.get('input[name=email]').type(email)
        cy.get('input[name=username]').type(username)
        cy.get('input[name=password]').type(`${password}{enter}`)

        cy.url().should('be', '/')
        cy.get('h3').should('contain', username)
    })

    it('email already in use', function () {
        cy.route('POST', 'authentication/local/register', registerResponse["409_email"]).as('used_email');

        const { email, password } = user;
        cy.get('input[name=email]').type(`${email}`);
        cy.get('input[name=password]').type(`${password}`);
        cy.get('input[name=username]').type(`username{enter}`);

        cy.wait('@used_email').then((xhr) => {
            cy.url().should('be', '/register');
            expect(xhr.response.body.message).to.equal(xhr.response.body.message, registerResponse["409_email"].message);
        });
    })
    it('username already in use', function () {
        cy.route('POST', 'authentication/local/register', registerResponse["409_username"]).as('used_username');

        const { username, password } = user;
        cy.get('input[name=email]').type(`toto@gmail.com`);
        cy.get('input[name=password]').type(`${password}`);
        cy.get('input[name=username]').type(`${username}{enter}`);

        cy.wait('@used_username').then((xhr) => {
            cy.url().should('be', '/register');
            expect(xhr.response.body.message).to.equal(xhr.response.body.message, registerResponse["409_username"].message);
        });
    })

    it('invalid email format', function () {
        const { password } = user;
        cy.get('input[name=email]').type(`${password}{enter}`);

        cy.url().should('be', '/register');
        cy.get('span').should('contain', messages.invalidEmail);
    })
    it('username too short', function () {
        cy.get('input[name=username]').type(`a{enter}`);

        cy.url().should('be', '/register');
        cy.get('span').should('contain', messages.shortUsername);
    })
    it('username too long', function () {
        cy.get('input[name=username]').type(`superlongusernamewithalotofchar{enter}`);

        cy.url().should('be', '/register');
        cy.get('span').should('contain', messages.longUsername);
    })

    it('email required', function () {
        cy.get('input[name=email]').type('{enter}')

        cy.url().should('be', '/register')
        cy.get('span').should('contain', messages.requiredEmail);
    })
    it('password required', function () {
        cy.get('input[name=password]').type('{enter}')

        cy.url().should('be', '/register')
        cy.get('span').should('contain', messages.requiredPassword);
    })
    it('username required', function () {
        cy.get('input[name=username]').type('{enter}')

        cy.url().should('be', '/register')
        cy.get('span').should('contain', messages.requiredUsername);
    })
    it('fields required', function () {
        cy.get('input[name=email]').type('{enter}')
        cy.get('input[name=password]').type('{enter}')
        cy.get('input[name=username]').type('{enter}')

        cy.url().should('be', '/register')
        cy.get('span').should('contain', messages.requiredEmail);
        cy.get('span').should('contain', messages.requiredPassword);
        cy.get('span').should('contain', messages.requiredUsername);
    })
})
