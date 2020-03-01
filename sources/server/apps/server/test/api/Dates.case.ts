import { T721SDK, AxiosResponse } from '@ticket721sources/sdk';
import { Wallet, createWallet } from '@ticket721sources/global';
import { LocalRegisterResponseDto } from '@app/server/authentication/dto/LocalRegisterResponse.dto';
import { INestApplication } from '@nestjs/common';
import { EmailValidationResponseDto } from '@app/server/authentication/dto/EmailValidationResponse.dto';
import { DatesSearchResponseDto } from '@app/server/controllers/dates/dto/DatesSearchResponse.dto';

export async function fetchDates(getCtx: () => { app: INestApplication; sdk: T721SDK }): Promise<void> {
    jest.setTimeout(60000);
    const { sdk }: { sdk: T721SDK } = getCtx();

    const wallet: Wallet = await createWallet();
    const password = 'xqd65g87sh76_98d-';
    const email = 'test@test.com';
    const username = 'mortimr';

    const reg_res = (await sdk.localRegister(email, password, username, wallet, () => {}, 'fr')) as any;

    expect(reg_res.report_status).toEqual(undefined);

    const resp: AxiosResponse<LocalRegisterResponseDto> = reg_res as AxiosResponse<LocalRegisterResponseDto>;
    expect(resp.data).toBeDefined();
    expect(resp.data.user.email).toEqual(email);
    expect(resp.data.user.username).toEqual(username);
    expect(resp.data.user.locale).toEqual('fr');
    expect(resp.data.user.valid).toEqual(false);
    expect(resp.data.token).toBeDefined();
    expect(resp.status).toEqual(201);
    expect(resp.statusText).toEqual('Created');
    expect(resp.data.validationToken).toBeDefined();

    const validation_req: AxiosResponse<EmailValidationResponseDto> = await sdk.validateEmail(
        resp.data.validationToken,
    );

    expect(validation_req.data).toBeDefined();
    expect(validation_req.data.user.valid).toEqual(true);

    {
        const fetchedActions: AxiosResponse<DatesSearchResponseDto> = await sdk.dates.search(resp.data.token, {
            location_label: {
                $eq: '3 rue des boulevards',
            },
        });

        expect(fetchedActions.data).toEqual({
            dates: [],
        });
    }

    {
        const fetchedActions: AxiosResponse<DatesSearchResponseDto> = await sdk.dates.search('', {
            location_label: {
                $eq: '3 rue des boulevards',
            },
        });

        expect(fetchedActions.data).toEqual({
            dates: [],
        });
    }
}
