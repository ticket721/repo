import { AxiosInstance, AxiosResponse, default as axios } from 'axios';

export { AxiosResponse } from 'axios';

// APP
import { getAPIInfos } from './app/app';
import request         from 'supertest';

// AUTHENTICATION
import { localLogin, localRegister, web3Register, web3RegisterPayload, web3Login, web3LoginPayload, validateEmail } from './app/api/authentication';

// ACTIONS
import { actionsCreate, actionsSearch, actionsUpdate } from './app/api/actions';

// IMAGES
import { uploadImage } from './app/api/images';

// DATES
import { datesAddCategories, datesCreate, datesDeleteCategories, datesSearch, datesUpdate } from './app/api/dates';
import {
    eventsAddCategories, eventsAddDates,
    eventsCreate, eventsCreateAdminsConfiguration, eventsCreateCategoriesConfiguration,
    eventsCreateDatesConfiguration, eventsCreateImagesMetadata,
    eventsCreateModulesConfiguration,
    eventsCreateTextMetadata, eventsDeleteCategories, eventsDeleteDates,
    eventsSearch, eventsStart, eventsUpdate,
}                                                               from './app/api/events';
import { txsInfos, txsSearch, txsSubscribe }                    from './app/api/txs';
import { contractsFetch }                                       from './app/api/contracts';
import { categoriesCreate, categoriesSearch, categoriesUpdate } from './app/api/categories';
import { rightsSearch }                                         from './app/api/rights';
import { metadatasFetch }                                       from './app/api/metadatas';
import { cartModulesConfiguration, cartTicketSelections }       from './app/api/cart';
import { checkoutCartCommitStripe }                             from './app/api/checkout';

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
        this.validateEmail = this.validateEmail.bind(this);

        this.actions.search = this.actions.search.bind(this);
        this.actions.update = this.actions.update.bind(this);
        this.actions.create = this.actions.create.bind(this);

        this.dates.search = this.dates.search.bind(this);
        this.dates.create = this.dates.create.bind(this);
        this.dates.addCategories = this.dates.addCategories.bind(this);
        this.dates.deleteCategories = this.dates.deleteCategories.bind(this);
        this.dates.update = this.dates.update.bind(this);

        this.events.create.create = this.events.create.create.bind(this);
        this.events.create.textMetadata = this.events.create.textMetadata.bind(this);
        this.events.create.modulesConfiguration = this.events.create.modulesConfiguration.bind(this);
        this.events.create.datesConfiguration = this.events.create.datesConfiguration.bind(this);
        this.events.create.categoriesConfiguration = this.events.create.categoriesConfiguration.bind(this);
        this.events.create.imagesMetadata = this.events.create.imagesMetadata.bind(this);
        this.events.create.adminsConfiguration = this.events.create.adminsConfiguration.bind(this);
        this.events.search = this.events.search.bind(this);
        this.events.start = this.events.start.bind(this);
        this.events.update = this.events.update.bind(this);
        this.events.deleteCategories = this.events.deleteCategories.bind(this);
        this.events.addCategories = this.events.addCategories.bind(this);
        this.events.deleteDates = this.events.deleteDates.bind(this);
        this.events.addDates = this.events.addDates.bind(this);

        this.categories.create = this.categories.create.bind(this);
        this.categories.search = this.categories.search.bind(this);
        this.categories.update = this.categories.update.bind(this);

        this.rights.search = this.rights.search.bind(this);

        this.images.upload = this.images.upload.bind(this);

        this.txs.search = this.txs.search.bind(this);
        this.txs.subscribe = this.txs.subscribe.bind(this);
        this.txs.infos = this.txs.infos.bind(this);

        this.contracts.fetch = this.contracts.fetch.bind(this);

        this.metadatas.fetch = this.metadatas.fetch.bind(this);

        this.cart.ticketSelections = this.cart.ticketSelections.bind(this);
        this.cart.modulesConfiguration = this.cart.modulesConfiguration.bind(this);
        this.checkout.cart.commitStripe = this.checkout.cart.commitStripe.bind(this);
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

    async post<Body>(route: string, headers: HTTPHeader, body: Body): Promise<AxiosResponse> {

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

    async put<Body>(route: string, headers: HTTPHeader, body: Body): Promise<AxiosResponse> {

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

    async delete<Body>(route: string, headers: HTTPHeader, body: Body): Promise<AxiosResponse> {

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
    public validateEmail = validateEmail;

    public actions = {
        search: actionsSearch,
        update: actionsUpdate,
        create: actionsCreate,
    };

    public dates = {
        search: datesSearch,
        create: datesCreate,
        addCategories: datesAddCategories,
        deleteCategories: datesDeleteCategories,
        update: datesUpdate,
    };

    public events = {
        search: eventsSearch,
        create: {
            create: eventsCreate,
            textMetadata: eventsCreateTextMetadata,
            modulesConfiguration: eventsCreateModulesConfiguration,
            datesConfiguration: eventsCreateDatesConfiguration,
            categoriesConfiguration: eventsCreateCategoriesConfiguration,
            imagesMetadata: eventsCreateImagesMetadata,
            adminsConfiguration: eventsCreateAdminsConfiguration,
        },
        update: eventsUpdate,
        start: eventsStart,
        deleteCategories: eventsDeleteCategories,
        addCategories: eventsAddCategories,
        deleteDates: eventsDeleteDates,
        addDates: eventsAddDates,
    };

    public rights = {
        search: rightsSearch,
    };

    public categories = {
        search: categoriesSearch,
        create: categoriesCreate,
        update: categoriesUpdate,
    };

    public images = {
        upload: uploadImage,
    };

    public txs = {
        search: txsSearch,
        subscribe: txsSubscribe,
        infos: txsInfos,
    };

    public contracts = {
        fetch: contractsFetch,
    };

    public metadatas = {
        fetch: metadatasFetch,
    };

    public cart = {
        ticketSelections: cartTicketSelections,
        modulesConfiguration: cartModulesConfiguration,
    };

    public checkout = {
        cart: {
            commitStripe: checkoutCartCommitStripe
        }
    }
}
