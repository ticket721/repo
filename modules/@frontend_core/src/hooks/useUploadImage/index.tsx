import { useLazyRequest } from '../useLazyRequest';
import { useState } from 'react';
import { v4 } from 'uuid';
import { ImagesUploadResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/images/dto/ImagesUploadResponse.dto';

export const useUploadImage = (
    token: string,
): {
    url: string;
    error: any;
    loading: boolean;
    uploadImage: (file: Blob, randomId: string) => void;
} => {
    const [uuid] = useState(v4());

    const { response, lazyRequest } = useLazyRequest<ImagesUploadResponseDto>('images.upload', uuid);

    const uploadImage = (file: Blob, randomId: string) => {
        const formData = new FormData();
        formData.append('images', file);
        lazyRequest([token, formData, {}, randomId]);
    };

    return {
        url: response?.data?.urls[0],
        error: response?.error,
        loading: response?.loading,
        uploadImage,
    };
};
