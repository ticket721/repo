import { AxiosResponse }           from 'axios';
import { T721SDK }                 from '../../index';
import { ImagesUploadInputDto }    from '@app/server/controllers/images/dto/ImagesUploadInput.dto';
import { ImagesUploadResponseDto } from '@app/server/controllers/images/dto/ImagesUploadResponse.dto';

export async function uploadImage(
    token: string,
    formdata: any,
    headers: any,
): Promise<AxiosResponse<ImagesUploadResponseDto>> {

    const self: T721SDK = this;

    return self.post<ImagesUploadInputDto>('/images', {
        ...headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/form-data`,
    }, formdata);
}
