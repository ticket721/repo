import { AxiosInstance, AxiosResponse, default as axios } from 'axios';

// APP
import {getAPIInfos}  from './app/app';
import * as request from 'supertest';

interface HTTPHeader {
    [key:string]: string;
}

export class T721SDK {

    public host: string;
    public port: number;
    public protocol: 'http' | 'https';
    public axios: AxiosInstance;

    constructor() {
        this.getApiInfos = this.getApiInfos.bind(this);
    }

    connect(host: string, port: number, protocol: 'http' | 'https' = 'http') {
        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.axios = axios.create({
            baseURL: `${this.protocol}://${this.host}:${this.port.toString()}`,
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    local(http: any) {
        const res = request(http).get('/');
        this.axios = axios.create({
            baseURL: res.url,
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async get(route: string, headers: HTTPHeader): Promise<AxiosResponse> {

        if (this.axios) {
            return this.axios({
                method: 'get',
                headers
            });
        } else {
            throw new Error(`Client not connected`);
        }

    }

    public getApiInfos = getAPIInfos;
}

