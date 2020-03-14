import { INestApplication } from '@nestjs/common';
import { T721SDK } from '@common/sdk';
import { createEvent } from '../../../../../@backend_simulation';
import { createWallet } from '@common/global';
import { AxiosResponse } from 'axios';
import config from '../../../../../@backend_simulation/config';
import * as path from 'path';

export async function deployJustice(getCtx: () => { app: INestApplication; sdk: T721SDK }) {
    const { app, sdk } = getCtx();

    const wallet = await createWallet();
    const res: AxiosResponse = (await sdk.localRegister(config.email, config.password, 'tester')) as AxiosResponse;
    await sdk.validateEmail(res.data.validationToken);
    const token = res.data.token;
    const user = res.data.user;

    try {
        await createEvent(
            user,
            sdk,
            token,
            'justice',
            path.resolve(__dirname + '/../../../../../@backend_simulation/events/justice/images'),
        );
    } catch (e) {
        console.error(e);
        throw e;
    }
}
