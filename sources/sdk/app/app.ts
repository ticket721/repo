import { AxiosResponse } from 'axios';
import { APIInfos }      from '../../server/src/app.types';

export async function getAPIInfos(): Promise<AxiosResponse<APIInfos>> {
    return this.get('/', {})
}
