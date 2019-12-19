import { AxiosInstance, AxiosResponse, default as axios } from 'axios';

export { AxiosResponse } from 'axios';

// APP
import { getAPIInfos } from './app/app';
import * as request    from 'supertest';

// AUTHENTICATION
import { localLogin, localRegister, web3Register, web3RegisterPayload, web3Login, web3LoginPayload } from './app/api/authentication';

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
    }

    connect(host: string, port: number, protocol: 'http' | 'https' = 'http') {
        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.axios = axios.create({
            baseURL: `${this.protocol}://${this.host}:${this.port.toString()}`,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    local(http: any) {
        const res = request(http).get('/');
        this.axios = axios.create({
            baseURL: res.url,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
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

    public getApiInfos = getAPIInfos;

    public localRegister = localRegister;
    public localLogin = localLogin;
    public web3Register = web3Register;
    public web3RegisterPayload = web3RegisterPayload;
    public web3Login = web3Login;
    public web3LoginPayload = web3LoginPayload;
}

