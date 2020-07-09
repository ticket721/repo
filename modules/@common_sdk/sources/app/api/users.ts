import { AxiosResponse }                    from 'axios';
import { T721SDK }                          from '../../index';
import { UsersMeResponseDto }               from '@app/server/controllers/users/dto/UsersMeResponse.dto';
import { UsersSetDeviceAddressInputDto }    from '@app/server/controllers/users/dto/UsersSetDeviceAddressInput.dto';
import { UsersSetDeviceAddressResponseDto } from '@app/server/controllers/users/dto/UsersSetDeviceAddressResponse.dto';

export async function usersMe(token: string): Promise<AxiosResponse<UsersMeResponseDto>> {

    const self: T721SDK = this;

    return self.get('/users/me', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });

}

export async function usersSetDeviceAddress(
    token: string,
    query: UsersSetDeviceAddressInputDto,
): Promise<AxiosResponse<UsersSetDeviceAddressResponseDto>> {

    const self: T721SDK = this;

    return self.put<Partial<UsersSetDeviceAddressInputDto>>('/users/device-address', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

