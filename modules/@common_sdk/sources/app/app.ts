import { AxiosResponse } from 'axios';
import { APIInfos }      from '@app/server/Server.types';

export async function getAPIInfos(): Promise<AxiosResponse<APIInfos>> {
    return this.get('/', {});
}
