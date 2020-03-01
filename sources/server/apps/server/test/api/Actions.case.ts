import { T721SDK, AxiosResponse } from '@ticket721sources/sdk';
import { Wallet, createWallet } from '@ticket721sources/global';
import { LocalRegisterResponseDto } from '@app/server/authentication/dto/LocalRegisterResponse.dto';
import { INestApplication } from '@nestjs/common';
import { EmailValidationResponseDto } from '@app/server/authentication/dto/EmailValidationResponse.dto';
import { ActionsSearchResponseDto } from '@app/server/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';

export async function fetchActions(getCtx: () => { app: INestApplication; sdk: T721SDK }): Promise<void> {
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

    await expect(
        sdk.actions.search('', {
            current_status: {
                $eq: 'complete',
            },
        }),
    ).rejects.toMatchObject({
        response: {
            data: {
                statusCode: StatusCodes.Unauthorized,
            },
            status: StatusCodes.Unauthorized,
            statusText: StatusNames[StatusCodes.Unauthorized],
        },
    });

    const fetchedActions: AxiosResponse<ActionsSearchResponseDto> = await sdk.actions.search(resp.data.token, {
        current_status: {
            $eq: 'complete',
        },
    });

    expect(fetchedActions.data).toEqual({
        actionsets: [],
    });
}
