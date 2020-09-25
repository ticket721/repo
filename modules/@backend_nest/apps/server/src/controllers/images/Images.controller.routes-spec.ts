import Jimp from 'jimp';
import { generateUserName, getSDKAndUser } from '../../../test/utils';
import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import FormData from 'form-data';
import * as fs from 'fs';
import { AxiosResponse } from 'axios';
import { ImagesUploadResponseDto } from '@app/server/controllers/images/dto/ImagesUploadResponse.dto';

const generateImage = async (): Promise<string> => {
    const image = `/tmp/${generateUserName()}${generateUserName()}.png`;

    const jimpImage = new Jimp(2000, 36, 'green');

    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    await jimpImage.print(font, 10, 10, image);
    await jimpImage.writeAsync(image);
    return image;
};

const cleanImage = (image: string): void => {
    fs.unlinkSync(image);
};

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('upload (POST /images)', function() {
            test('should upload image', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const image = await generateImage();

                const form = new FormData();

                form.append('images', fs.readFileSync(image), {
                    filename: 'avatar.png',
                });

                const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
                    token,
                    form.getBuffer(),
                    form.getHeaders(),
                );

                expect(imageUploadRes.data.urls.length).toEqual(1);

                cleanImage(image);
            });

        });
    };
}
