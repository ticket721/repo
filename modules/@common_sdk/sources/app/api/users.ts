import { AxiosResponse }       from 'axios';
import { T721SDK }             from '../../index';
import { UsersMeResponseDto }  from '@app/server/controllers/users/dto/UsersMeResponse.dto';

export async function usersMe(token: string): Promise<AxiosResponse<UsersMeResponseDto>> {

    const self: T721SDK = this;

    return self.get('/users/me', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });

}
