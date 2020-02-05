import { AxiosResponse }             from 'axios';
import { T721SDK }                   from '../../index';
import { ContractsFetchResponseDto } from '@app/server/controllers/contracts/dto/ContractsFetchResponse.dto';

export async function contractsFetch(): Promise<AxiosResponse<ContractsFetchResponseDto>> {

    const self: T721SDK = this;

    return self.get('/contracts', {
        'Content-Type': 'application/json',
    });
}
