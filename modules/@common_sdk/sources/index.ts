import { AxiosInstance, AxiosResponse, default as axios } from 'axios';

export { AxiosResponse } from 'axios';

// APP
import { getAPIInfos } from './app/app';
import request         from 'supertest';

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
    resendValidation,
} from './app/api/authentication';

// ACTIONS
import {
    actionsConsumeUpdate,
    actionsCreate,
    actionsSearch,
    actionsCount,
    actionsUpdate,
} from './app/api/actions';

// IMAGES
import { uploadImage } from './app/api/images';

// DATES
import {
    datesAddCategory,
    datesCount, datesDelete, datesEdit,
    datesFuzzySearch,
    datesHomeSearch, datesOwner,
    datesSearch,
} from './app/api/dates';

// EVENTS
import {
    eventsCount,
    eventsCreate,
    eventsSearch,
    eventsGuestlist, eventsAddDate, eventsEdit, eventsStatus, eventsBindStripeInterface, eventsOwner,
} from './app/api/events';

// TXS
import { txsCount, txsInfos, txsSearch, txsSubscribe } from './app/api/txs';

// CONTRACTS
import { contractsFetch } from './app/api/contracts';

// CATEGORIES
import {
    categoriesAddDateLink,
    categoriesCount, categoriesDelete, categoriesEdit, categoriesOwner, categoriesRemoveDateLink,
    categoriesSearch, categoriesTicketCount,
} from './app/api/categories';

// RIGHTS
import { rightsSearch } from './app/api/rights';

// METADATAS
import { metadatasFetch } from './app/api/metadatas';

// TICKETS
import {
    ticketsSearch,
    ticketsCount,
    ticketsValidate,
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
    paymentStripeFetchBalance,
    paymentStripeCreateConnectAccount, paymentStripePayout, paymentStripeTransactions,
} from './app/api/payment';

// PURCHASES
import { purchasesCheckout, purchasesClose, purchasesFetch, purchasesSetProducts } from './app/api/purchases';

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
        this.dates.addCategory = this.dates.count.bind(this);
        this.dates.edit = this.dates.edit.bind(this);
        this.dates.delete = this.dates.delete.bind(this);
        this.dates.owner = this.dates.owner.bind(this);

        this.events.create.create = this.events.create.create.bind(this);
        this.events.search = this.events.search.bind(this);
        this.events.count = this.events.count.bind(this);
        this.events.guestlist = this.events.guestlist.bind(this);
        this.events.addDate = this.events.addDate.bind(this);
        this.events.edit = this.events.edit.bind(this);
        this.events.status = this.events.status.bind(this);
        this.events.bindStripeInterface = this.events.bindStripeInterface.bind(this);
        this.events.owner = this.events.owner.bind(this);

        this.categories.count = this.categories.count.bind(this);
        this.categories.search = this.categories.search.bind(this);
        this.categories.addDateLink = this.categories.addDateLink.bind(this);
        this.categories.removeDateLink = this.categories.removeDateLink.bind(this);
        this.categories.edit = this.categories.edit.bind(this);
        this.categories.delete = this.categories.delete.bind(this);
        this.categories.owner = this.categories.owner.bind(this);
        this.categories.countTickets = this.categories.countTickets.bind(this);

        this.rights.search = this.rights.search.bind(this);

        this.images.upload = this.images.upload.bind(this);

        this.txs.search = this.txs.search.bind(this);
        this.txs.count = this.txs.count.bind(this);
        this.txs.subscribe = this.txs.subscribe.bind(this);
        this.txs.infos = this.txs.infos.bind(this);

        this.contracts.fetch = this.contracts.fetch.bind(this);

        this.metadatas.fetch = this.metadatas.fetch.bind(this);

        this.tickets.search = this.tickets.search.bind(this);
        this.tickets.count = this.tickets.count.bind(this);
        this.tickets.validate = this.tickets.validate.bind(this);

        this.geoloc.closestCity = this.geoloc.closestCity.bind(this);
        this.geoloc.fuzzySearch = this.geoloc.fuzzySearch.bind(this);

        this.featureFlags.fetch = this.featureFlags.fetch.bind(this);

        this.payment.stripe.fetchInterface = this.payment.stripe.fetchInterface.bind(
            this,
        );
        this.payment.stripe.fetchBalance = this.payment.stripe.fetchBalance.bind(
            this,
        );
        this.payment.stripe.createInterface = this.payment.stripe.createInterface.bind(
            this,
        );
        this.payment.stripe.createConnectAccount = this.payment.stripe.createConnectAccount.bind(
            this,
        );
        this.payment.stripe.addExternalAccount = this.payment.stripe.addExternalAccount.bind(
            this,
        );
        this.payment.stripe.removeExternalAccount = this.payment.stripe.removeExternalAccount.bind(
            this,
        );
        this.payment.stripe.generateOnboardingUrl = this.payment.stripe.generateOnboardingUrl.bind(
            this,
        );
        this.payment.stripe.generateUpdateUrl = this.payment.stripe.generateUpdateUrl.bind(
            this,
        );
        this.payment.stripe.setDefaultExternalAccount = this.payment.stripe.setDefaultExternalAccount.bind(
            this,
        );
        this.payment.stripe.payout = this.payment.stripe.payout.bind(
            this,
        );
        this.payment.stripe.transactions = this.payment.stripe.transactions.bind(
            this,
        );

        this.purchases.fetch = this.purchases.fetch.bind(this);
        this.purchases.setProducts = this.purchases.setProducts.bind(this);
        this.purchases.checkout = this.purchases.checkout.bind(this);
        this.purchases.close = this.purchases.close.bind(this);
    }

    connect(host: string, port: number, protocol: 'http' | 'https' = 'http') {
        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.axios = axios.create({
            baseURL: `${this.protocol}://${this.host}:${this.port.toString()}`,
            timeout: 30000,
            headers: {
                Accept: 'application/json, multipart/form-data, text/plain, */*',
            },
        });
    }

    local(http: any) {
        const res = request(http).get('/');
        this.axios = axios.create({
            baseURL: res.url,
            timeout: 30000,
            headers: {
                Accept: 'application/json, multipart/form-data, text/plain, */*',
            },
        });
    }

    async get(route: string, headers: HTTPHeader): Promise<AxiosResponse> {
        if (this.axios) {
            return this.axios({
                method: 'get',
                headers,
                url: route,
            });
        } else {
            throw new Error(`Client not connected`);
        }
    }

    async post<Body>(
        route: string,
        headers: HTTPHeader,
        body: Body,
    ): Promise<AxiosResponse> {
        if (this.axios) {
            return this.axios({
                method: 'post',
                headers,
                data: body,
                url: route,
            });
        } else {
            throw new Error(`Client not connected`);
        }
    }

    async put<Body>(
        route: string,
        headers: HTTPHeader,
        body: Body,
    ): Promise<AxiosResponse> {
        if (this.axios) {
            return this.axios({
                method: 'put',
                headers,
                data: body,
                url: route,
            });
        } else {
            throw new Error(`Client not connected`);
        }
    }

    async delete<Body>(
        route: string,
        headers: HTTPHeader,
        body: Body,
    ): Promise<AxiosResponse> {
        if (this.axios) {
            return this.axios({
                method: 'delete',
                headers,
                data: body,
                url: route,
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
        setDeviceAddress: usersSetDeviceAddress,
    };

    public actions = {
        search: actionsSearch,
        count: actionsCount,
        update: actionsUpdate,
        create: actionsCreate,
        consumeUpdate: actionsConsumeUpdate,
    };

    public dates = {
        search: datesSearch,
        homeSearch: datesHomeSearch,
        fuzzySearch: datesFuzzySearch,
        owner: datesOwner,
        count: datesCount,
        addCategory: datesAddCategory,
        edit: datesEdit,
        delete: datesDelete,
    };

    public events = {
        search: eventsSearch,
        count: eventsCount,
        owner: eventsOwner,
        create: {
            create: eventsCreate,
        },
        guestlist: eventsGuestlist,
        addDate: eventsAddDate,
        edit: eventsEdit,
        status: eventsStatus,
        bindStripeInterface: eventsBindStripeInterface,
    };

    public rights = {
        search: rightsSearch,
    };

    public categories = {
        search: categoriesSearch,
        owner: categoriesOwner,
        count: categoriesCount,
        addDateLink: categoriesAddDateLink,
        removeDateLink: categoriesRemoveDateLink,
        countTickets: categoriesTicketCount,
        edit: categoriesEdit,
        delete: categoriesDelete,
    };

    public images = {
        upload: uploadImage,
    };

    public txs = {
        search: txsSearch,
        count: txsCount,
        subscribe: txsSubscribe,
        infos: txsInfos,
    };

    public contracts = {
        fetch: contractsFetch,
    };

    public metadatas = {
        fetch: metadatasFetch,
    };

    public tickets = {
        search: ticketsSearch,
        count: ticketsCount,
        validate: ticketsValidate,
    };

    public geoloc = {
        closestCity: geolocClosestCity,
        fuzzySearch: geolocFuzzySearch,
    };

    public featureFlags = {
        fetch: featureFlagsFetch,
    };

    public payment = {
        stripe: {
            fetchInterface: paymentStripeFetchInterface,
            fetchBalance: paymentStripeFetchBalance,
            createInterface: paymentStripeCreateInterface,
            createConnectAccount: paymentStripeCreateConnectAccount,
            addExternalAccount: paymentStripeAddExternalAccount,
            removeExternalAccount: paymentStripeRemoveExternalAccount,
            setDefaultExternalAccount: paymentStripeSetDefaultExternalAccount,
            generateOnboardingUrl: paymentStripeGenerateOnboardingUrl,
            generateUpdateUrl: paymentStripeGenerateUpdateUrl,
            payout: paymentStripePayout,
            transactions: paymentStripeTransactions,
        },
    };

    public purchases = {
        fetch: purchasesFetch,
        setProducts: purchasesSetProducts,
        checkout: purchasesCheckout,
        close: purchasesClose,
    };
}
