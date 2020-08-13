import { AxiosInstance, AxiosResponse, default as axios } from 'axios';

export { AxiosResponse } from 'axios';

// APP
import { getAPIInfos } from './app/app';
import request from 'supertest';

// AUTHENTICATION
import {
    localLogin,
    localRegister,
    web3Register,
    web3RegisterPayload,
    web3Login,
    web3LoginPayload,
    validateEmail,
    resetPassword,
    validateResetPassword,
    updatePassword,
    resendValidation
} from './app/api/authentication';

// ACTIONS
import {
    actionsConsumeUpdate,
    actionsCreate,
    actionsSearch,
    actionsCount,
    actionsUpdate
} from './app/api/actions';

// IMAGES
import { uploadImage } from './app/api/images';

// DATES
import {
    datesAddCategories,
    datesCount,
    datesCreate,
    datesDeleteCategories,
    datesFuzzySearch,
    datesHomeSearch,
    datesSearch,
    datesUpdate
} from './app/api/dates';

// EVENTS
import {
    eventsAddCategories,
    eventsAddDates,
    eventsCount,
    eventsCreate,
    eventsCreateAdminsConfiguration,
    eventsCreateCategoriesConfiguration,
    eventsCreateDatesConfiguration,
    eventsCreateImagesMetadata,
    eventsCreateModulesConfiguration,
    eventsCreateTextMetadata,
    eventsDeleteCategories,
    eventsDeleteDates,
    eventsSearch,
    eventsStart,
    eventsUpdate /*eventsWithdraw, */,
    eventsGuestlist
} from './app/api/events';

// TXS
import { txsCount, txsInfos, txsSearch, txsSubscribe } from './app/api/txs';

// CONTRACTS
import { contractsFetch } from './app/api/contracts';

// CATEGORIES
import {
    categoriesCount,
    categoriesCreate,
    categoriesSearch,
    categoriesUpdate
} from './app/api/categories';

// RIGHTS
import { rightsSearch } from './app/api/rights';

// METADATAS
import { metadatasFetch } from './app/api/metadatas';

// CART
import { cartModulesConfiguration, cartTicketSelections } from './app/api/cart';

// CHECKOUT
import {
    checkoutCartCommitStripe,
    checkoutResolveCartWithPaymentIntent
} from './app/api/checkout';

// DOSOJIN
import { dosojinSearch, dosojinCount } from './app/api/dosojin';

// TICKETS
import {
    ticketsSearch,
    ticketsCount,
    ticketsValidate
} from './app/api/tickets';

// USERS
import { usersMe, usersSetDeviceAddress } from './app/api/users';

// GEOLOC
import { geolocClosestCity, geolocFuzzySearch } from './app/api/geoloc';

// FEATURE FLAGS
import { featureFlagsFetch } from './app/api/feature-flags';

// PAYMENT
import {
    paymentStripeAddExternalAccount,
    paymentStripeCreateInterface,
    paymentStripeFetchInterface,
    paymentStripeGenerateOnboardingUrl,
    paymentStripeGenerateUpdateUrl,
    paymentStripeRemoveExternalAccount,
    paymentStripeSetDefaultExternalAccount,
    paymentStripeFetchBalance
} from './app/api/payment';

export { FailedRegisterReport } from './app/api/authentication';

interface HTTPHeader {
    [key: string]: string;
}

export class T721SDK {
    public host: string;
    public port: number;
    public protocol: 'http' | 'https';
    public axios: AxiosInstance;

    constructor() {
        this.getApiInfos = this.getApiInfos.bind(this);

        this.localRegister = this.localRegister.bind(this);
        this.localLogin = this.localLogin.bind(this);
        this.web3Register = this.web3Register.bind(this);
        this.web3Login = this.web3Login.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.validateResetPassword = this.validateResetPassword.bind(this);
        this.resendValidation = this.resendValidation.bind(this);

        this.users.me = this.users.me.bind(this);
        this.users.setDeviceAddress = this.users.setDeviceAddress.bind(this);

        this.actions.search = this.actions.search.bind(this);
        this.actions.count = this.actions.count.bind(this);
        this.actions.update = this.actions.update.bind(this);
        this.actions.create = this.actions.create.bind(this);
        this.actions.consumeUpdate = this.actions.consumeUpdate.bind(this);

        this.dates.search = this.dates.search.bind(this);
        this.dates.homeSearch = this.dates.homeSearch.bind(this);
        this.dates.fuzzySearch = this.dates.fuzzySearch.bind(this);
        this.dates.count = this.dates.count.bind(this);
        this.dates.create = this.dates.create.bind(this);
        this.dates.addCategories = this.dates.addCategories.bind(this);
        this.dates.deleteCategories = this.dates.deleteCategories.bind(this);
        this.dates.update = this.dates.update.bind(this);

        this.events.create.create = this.events.create.create.bind(this);
        this.events.create.textMetadata = this.events.create.textMetadata.bind(
            this
        );
        this.events.create.modulesConfiguration = this.events.create.modulesConfiguration.bind(
            this
        );
        this.events.create.datesConfiguration = this.events.create.datesConfiguration.bind(
            this
        );
        this.events.create.categoriesConfiguration = this.events.create.categoriesConfiguration.bind(
            this
        );
        this.events.create.imagesMetadata = this.events.create.imagesMetadata.bind(
            this
        );
        this.events.create.adminsConfiguration = this.events.create.adminsConfiguration.bind(
            this
        );
        this.events.search = this.events.search.bind(this);
        this.events.count = this.events.count.bind(this);
        this.events.start = this.events.start.bind(this);
        this.events.update = this.events.update.bind(this);
        this.events.deleteCategories = this.events.deleteCategories.bind(this);
        this.events.addCategories = this.events.addCategories.bind(this);
        this.events.deleteDates = this.events.deleteDates.bind(this);
        this.events.addDates = this.events.addDates.bind(this);
        // this.events.withdraw = this.events.withdraw.bind(this);
        this.events.guestlist = this.events.guestlist.bind(this);

        this.categories.create = this.categories.create.bind(this);
        this.categories.count = this.categories.count.bind(this);
        this.categories.search = this.categories.search.bind(this);
        this.categories.update = this.categories.update.bind(this);

        this.rights.search = this.rights.search.bind(this);

        this.images.upload = this.images.upload.bind(this);

        this.txs.search = this.txs.search.bind(this);
        this.txs.count = this.txs.count.bind(this);
        this.txs.subscribe = this.txs.subscribe.bind(this);
        this.txs.infos = this.txs.infos.bind(this);

        this.contracts.fetch = this.contracts.fetch.bind(this);

        this.metadatas.fetch = this.metadatas.fetch.bind(this);

        this.cart.ticketSelections = this.cart.ticketSelections.bind(this);
        this.cart.modulesConfiguration = this.cart.modulesConfiguration.bind(
            this
        );

        this.checkout.cart.commit.stripe = this.checkout.cart.commit.stripe.bind(
            this
        );
        this.checkout.cart.resolve.paymentIntent = this.checkout.cart.resolve.paymentIntent.bind(
            this
        );

        this.dosojin.search = this.dosojin.search.bind(this);
        this.dosojin.count = this.dosojin.count.bind(this);

        this.tickets.search = this.tickets.search.bind(this);
        this.tickets.count = this.tickets.count.bind(this);
        this.tickets.validate = this.tickets.validate.bind(this);

        this.geoloc.closestCity = this.geoloc.closestCity.bind(this);
        this.geoloc.fuzzySearch = this.geoloc.fuzzySearch.bind(this);

        this.featureFlags.fetch = this.featureFlags.fetch.bind(this);

        this.payment.stripe.fetchInterface = this.payment.stripe.fetchInterface.bind(
            this
        );
        this.payment.stripe.fetchBalance = this.payment.stripe.fetchBalance.bind(
            this
        );
        this.payment.stripe.createInterface = this.payment.stripe.createInterface.bind(
            this
        );
        this.payment.stripe.addExternalAccount = this.payment.stripe.addExternalAccount.bind(
            this
        );
        this.payment.stripe.removeExternalAccount = this.payment.stripe.removeExternalAccount.bind(
            this
        );
        this.payment.stripe.generateOnboardingUrl = this.payment.stripe.generateOnboardingUrl.bind(
            this
        );
        this.payment.stripe.generateUpdateUrl = this.payment.stripe.generateUpdateUrl.bind(
            this
        );
        this.payment.stripe.setDefaultExternalAccount = this.payment.stripe.setDefaultExternalAccount.bind(
            this
        );
    }

    connect(host: string, port: number, protocol: 'http' | 'https' = 'http') {
        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.axios = axios.create({
            baseURL: `${this.protocol}://${this.host}:${this.port.toString()}`,
            timeout: 30000,
            headers: {
                Accept: 'application/json, multipart/form-data, text/plain, */*'
            }
        });
    }

    local(http: any) {
        const res = request(http).get('/');
        this.axios = axios.create({
            baseURL: res.url,
            timeout: 30000,
            headers: {
                Accept: 'application/json, multipart/form-data, text/plain, */*'
            }
        });
    }

    async get(route: string, headers: HTTPHeader): Promise<AxiosResponse> {
        if (this.axios) {
            return this.axios({
                method: 'get',
                headers,
                url: route
            });
        } else {
            throw new Error(`Client not connected`);
        }
    }

    async post<Body>(
        route: string,
        headers: HTTPHeader,
        body: Body
    ): Promise<AxiosResponse> {
        if (this.axios) {
            return this.axios({
                method: 'post',
                headers,
                data: body,
                url: route
            });
        } else {
            throw new Error(`Client not connected`);
        }
    }

    async put<Body>(
        route: string,
        headers: HTTPHeader,
        body: Body
    ): Promise<AxiosResponse> {
        if (this.axios) {
            return this.axios({
                method: 'put',
                headers,
                data: body,
                url: route
            });
        } else {
            throw new Error(`Client not connected`);
        }
    }

    async delete<Body>(
        route: string,
        headers: HTTPHeader,
        body: Body
    ): Promise<AxiosResponse> {
        if (this.axios) {
            return this.axios({
                method: 'delete',
                headers,
                data: body,
                url: route
            });
        } else {
            throw new Error(`Client not connected`);
        }
    }

    public getApiInfos = getAPIInfos;

    public localRegister = localRegister;
    public localLogin = localLogin;
    public web3Register = web3Register;
    public web3RegisterPayload = web3RegisterPayload;
    public web3Login = web3Login;
    public web3LoginPayload = web3LoginPayload;
    public updatePassword = updatePassword;
    public validateEmail = validateEmail;
    public resetPassword = resetPassword;
    public validateResetPassword = validateResetPassword;
    public resendValidation = resendValidation;

    public users = {
        me: usersMe,
        setDeviceAddress: usersSetDeviceAddress
    };

    public actions = {
        search: actionsSearch,
        count: actionsCount,
        update: actionsUpdate,
        create: actionsCreate,
        consumeUpdate: actionsConsumeUpdate
    };

    public dates = {
        search: datesSearch,
        homeSearch: datesHomeSearch,
        fuzzySearch: datesFuzzySearch,
        create: datesCreate,
        count: datesCount,
        addCategories: datesAddCategories,
        deleteCategories: datesDeleteCategories,
        update: datesUpdate
    };

    public events = {
        search: eventsSearch,
        count: eventsCount,
        create: {
            create: eventsCreate,
            textMetadata: eventsCreateTextMetadata,
            modulesConfiguration: eventsCreateModulesConfiguration,
            datesConfiguration: eventsCreateDatesConfiguration,
            categoriesConfiguration: eventsCreateCategoriesConfiguration,
            imagesMetadata: eventsCreateImagesMetadata,
            adminsConfiguration: eventsCreateAdminsConfiguration
        },
        update: eventsUpdate,
        start: eventsStart,
        deleteCategories: eventsDeleteCategories,
        addCategories: eventsAddCategories,
        deleteDates: eventsDeleteDates,
        addDates: eventsAddDates,
        // withdraw: eventsWithdraw,
        guestlist: eventsGuestlist
    };

    public rights = {
        search: rightsSearch
    };

    public categories = {
        search: categoriesSearch,
        count: categoriesCount,
        create: categoriesCreate,
        update: categoriesUpdate
    };

    public images = {
        upload: uploadImage
    };

    public txs = {
        search: txsSearch,
        count: txsCount,
        subscribe: txsSubscribe,
        infos: txsInfos
    };

    public contracts = {
        fetch: contractsFetch
    };

    public metadatas = {
        fetch: metadatasFetch
    };

    public cart = {
        ticketSelections: cartTicketSelections,
        modulesConfiguration: cartModulesConfiguration
    };

    public checkout = {
        cart: {
            commit: {
                stripe: checkoutCartCommitStripe
            },
            resolve: {
                paymentIntent: checkoutResolveCartWithPaymentIntent
            }
        }
    };

    public dosojin = {
        search: dosojinSearch,
        count: dosojinCount
    };

    public tickets = {
        search: ticketsSearch,
        count: ticketsCount,
        validate: ticketsValidate
    };

    public geoloc = {
        closestCity: geolocClosestCity,
        fuzzySearch: geolocFuzzySearch
    };

    public featureFlags = {
        fetch: featureFlagsFetch
    };

    public payment = {
        stripe: {
            fetchInterface: paymentStripeFetchInterface,
            fetchBalance: paymentStripeFetchBalance,
            createInterface: paymentStripeCreateInterface,
            addExternalAccount: paymentStripeAddExternalAccount,
            removeExternalAccount: paymentStripeRemoveExternalAccount,
            setDefaultExternalAccount: paymentStripeSetDefaultExternalAccount,
            generateOnboardingUrl: paymentStripeGenerateOnboardingUrl,
            generateUpdateUrl: paymentStripeGenerateUpdateUrl
        }
    };
}
