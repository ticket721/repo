import { AxiosInstance, AxiosResponse, default as axios } from 'axios';

export { AxiosResponse } from 'axios';

// APP
import { getAPIInfos } from './app/app';
import request         from 'supertest';

// AUTHENTICATION
import { localLogin, localRegister, web3Register, web3RegisterPayload, web3Login, web3LoginPayload, validateEmail } from './app/api/authentication';

// ACTIONS
import { actionsSearch, actionsUpdate } from './app/api/actions';

// IMAGES
import { uploadImage } from './app/api/images';

// DATES
import { datesSearch }             from './app/api/dates';
import {
    eventsBuild,
    eventsCreate, eventsCreateAdminsConfiguration, eventsCreateCategoriesConfiguration,
    eventsCreateDatesConfiguration, eventsCreateImagesMetadata,
    eventsCreateModulesConfiguration,
    eventsCreateTextMetadata, eventsDeploy, eventsDeployGeneratePayload,
    eventsSearch,
} from './app/api/events';
import { metaTx, txsInfos, txsSearch, txsSubscribe } from './app/api/txs';
import { contractsFetch }                            from './app/api/contracts';

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
        this.dates.search = this.dates.search.bind(this);
        this.events.create.init = this.events.create.init.bind(this);
        this.events.create.build = this.events.create.build.bind(this);
        this.events.create.textMetadata = this.events.create.textMetadata.bind(this);
        this.events.create.modulesConfiguration = this.events.create.modulesConfiguration.bind(this);
        this.events.create.datesConfiguration = this.events.create.datesConfiguration.bind(this);
        this.events.create.categoriesConfiguration = this.events.create.categoriesConfiguration.bind(this);
        this.events.create.imagesMetadata = this.events.create.imagesMetadata.bind(this);
        this.events.create.adminsConfiguration = this.events.create.adminsConfiguration.bind(this);
        this.events.deploy.generatePayload = this.events.deploy.generatePayload.bind(this);
        this.events.deploy.run = this.events.deploy.run.bind(this);
        this.events.search = this.events.search.bind(this);
        this.images.upload = this.images.upload.bind(this);
        this.txs.search = this.txs.search.bind(this);
        this.txs.subscribe = this.txs.subscribe.bind(this);
        this.txs.infos = this.txs.infos.bind(this);
        this.txs.metaTx = this.txs.metaTx.bind(this);
        this.contracts.fetch = this.contracts.fetch.bind(this);
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
    };

    public dates = {
        search: datesSearch,
    };

    public events = {
        search: eventsSearch,
        create: {
            init: eventsCreate,
            build: eventsBuild,
            textMetadata: eventsCreateTextMetadata,
            modulesConfiguration: eventsCreateModulesConfiguration,
            datesConfiguration: eventsCreateDatesConfiguration,
            categoriesConfiguration: eventsCreateCategoriesConfiguration,
            imagesMetadata: eventsCreateImagesMetadata,
            adminsConfiguration: eventsCreateAdminsConfiguration,
        },
        deploy: {
            generatePayload: eventsDeployGeneratePayload,
            run: eventsDeploy,
        },
    };

    public images = {
        upload: uploadImage,
    };

    public txs = {
        search: txsSearch,
        subscribe: txsSubscribe,
        infos: txsInfos,
        metaTx,
    };

    public contracts = {
        fetch: contractsFetch,
    };
}
