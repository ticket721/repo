import { T721SDK, AxiosResponse }                                                             from '@ticket721sources/sdk';
import ExpectStatic = Chai.ExpectStatic;
import { Wallet, createWallet, toAcceptedAddressFormat, Web3LoginSigner, Web3RegisterSigner } from '@ticket721sources/global';
import { use }                                                                                from 'chai';
import * as chaiAsPromised                                                                    from 'chai-as-promised';
import * as chaiSubset                                                                        from 'chai-subset';
import { LocalRegisterResponseDto }                                                           from '@app/server/authentication/dto/LocalRegisterResponse.dto';
import { LocalLoginResponseDto }                                                              from '@app/server/authentication/dto/LocalLoginResponse.dto';

use(chaiAsPromised);
use(chaiSubset);

export async function register(): Promise<void> {
    const { sdk, expect }: { sdk: T721SDK, expect: ExpectStatic } = this;

    const wallet: Wallet = await createWallet();
    const password = 'xqd65g87sh76_98d-';
    const email = 'test@test.com';
    const username = 'mortimr';

    const reg_res = (await sdk.localRegister(email, password, username, wallet, () => {
    })) as any;

    expect(reg_res.report_status).to.equal(undefined);

    const resp: AxiosResponse<LocalRegisterResponseDto> = reg_res as AxiosResponse<LocalRegisterResponseDto>;
    expect(resp.data).to.not.equal(undefined);
    expect(resp.data.user.email).to.equal(email);
    expect(resp.data.user.username).to.equal(username);
    expect(resp.data.user.address).to.equal(toAcceptedAddressFormat(wallet.address));
    expect(resp.data.token).to.not.equal(undefined);
    expect(resp.status).to.equal(201);
    expect(resp.statusText).to.equal('Created');

    const auth_res: AxiosResponse<LocalLoginResponseDto> = await sdk.localLogin('test@test.com', password);
    expect(auth_res.data).to.not.equal(undefined);
    expect(auth_res.data.user.email).to.equal(email);
    expect(auth_res.data.user.username).to.equal(username);
    expect(auth_res.data.user.address).to.equal(toAcceptedAddressFormat(wallet.address));
    expect(auth_res.data.token).to.not.equal(undefined);
    expect(auth_res.status).to.equal(200);
    expect(auth_res.statusText).to.equal('OK');

    try {
        await sdk.localRegister(email, password, username, wallet, () => {});
        expect(0).to.equal(1);
    } catch (e) {
        if (!e.response) throw e;
        expect(e.response).to.containSubset({
            data: {
                statusCode: 409,
                name: 'Conflict',
                message: 'email_already_in_use',
            },
            status: 409,
            statusText: 'Conflict',
        })
    }

    try {
        await sdk.localRegister('test2@test.com', password, username, wallet, () => {});
        expect(0).to.equal(2);
    } catch (e) {
        if (!e.response) throw e;
        expect(e.response).to.containSubset({
            data: {
                statusCode: 409,
                name: 'Conflict',
                message: 'username_already_in_use',
            },
            status: 409,
            statusText: 'Conflict',
        })
    }

    try {
        await sdk.localRegister('test2@test.com', password, 'mortimr2', wallet, () => {});
        expect(0).to.equal(3);
    } catch (e) {
        if (!e.response) throw e;
        expect(e.response).to.containSubset({
            data: {
                statusCode: 409,
                name: 'Conflict',
                message: 'address_already_in_use',
            },
            status: 409,
            statusText: 'Conflict'
        })
    }


}

export async function web3register(): Promise<void> {
    const { sdk, expect }: { sdk: T721SDK, expect: ExpectStatic } = this;

    const email = 'test@test.com';
    const username = 'mortimr';
    const wallet: Wallet = await createWallet();
    const other_wallet: Wallet = await createWallet();
    const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
    const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);

    const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
    const signedPayload = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);
    let loginPayload = web3LoginSigner.generateAuthenticationProofPayload();
    let signedLoginPayload = await web3LoginSigner.sign(wallet.privateKey, loginPayload[1]);

    const resp = await sdk.web3Register(email, username, registerPayload[0], wallet.address, signedPayload.hex);
    expect(resp.data).to.not.equal(undefined);
    expect(resp.data.user.wallet).to.equal(null);
    expect(resp.data.user.email).to.equal(email);
    expect(resp.data.user.username).to.equal(username);
    expect(resp.data.user.address).to.equal(toAcceptedAddressFormat(wallet.address));
    expect(resp.data.token).to.not.equal(undefined);
    expect(resp.status).to.equal(201);
    expect(resp.statusText).to.equal('Created');

    const login_resp = await sdk.web3Login(loginPayload[0], signedLoginPayload.hex);
    expect(login_resp.data).to.deep.equal({
        user: {
            address: toAcceptedAddressFormat(wallet.address),
            role: 'authenticated',
            type: 'web3',
            email: 'test@test.com',
            username: 'mortimr',
            id: login_resp.data.user.id,
        },
        token: login_resp.data.token,
    });

    const otherRegisterPayload = web3RegisterSigner.generateRegistrationProofPayload('other@test.com', 'other_user');
    const otherSignedPayload = await web3RegisterSigner.sign(other_wallet.privateKey, otherRegisterPayload[1]);
    await sdk.web3Register('other@test.com', 'other_user', otherRegisterPayload[0], other_wallet.address, otherSignedPayload.hex);

    try {
        await sdk.web3Register(email, username, registerPayload[0], wallet.address, signedPayload.hex);
        expect(0).to.equal(1);
    } catch (e) {
        if (!e.response) throw e;
        expect(e.response).to.containSubset({
            data: {
                message: 'email_already_in_use',
                statusCode: 409,
                name: 'Conflict',
            },
            statusText: 'Conflict',
            status: 409,
        })
    }

    try {
        await sdk.web3Register('test2@test.com', username, registerPayload[0], wallet.address, signedPayload.hex);
        expect(0).to.equal(2);
    } catch (e) {
        if (!e.response) throw e;
        expect(e.response).to.containSubset({
            data: {
                message: 'username_already_in_use',
                statusCode: 409,
                name: 'Conflict',
            },
            statusText: 'Conflict',
            status: 409,
        })
    }

    try {
        await sdk.web3Register('test2@test.com', 'mortimr2', registerPayload[0], (await createWallet()).address, '0x');
        expect(0).to.equal(3);
    } catch (e) {
        if (!e.response) throw e;
        expect(e.response).to.containSubset({
            data: {
                message: 'signature_check_fail',
                statusCode: 422,
                name: 'Unprocessable Entity',
            },
            statusText: 'Unprocessable Entity',
            status: 422,
        })
    }

    try {
        await sdk.web3Register('test2@test.com', 'mortimr2', registerPayload[0], (await createWallet()).address, signedPayload.hex);
        expect(0).to.equal(4);
    } catch (e) {
        if (!e.response) throw e;
        expect(e.response).to.containSubset({
            data: {
                message: 'invalid_signature',
                statusCode: 401,
                name: 'Unauthorized',
            },
            statusText: 'Unauthorized',
            status: 401,
        })
    }

    const conflictRegisterPayload = web3RegisterSigner.generateRegistrationProofPayload('test2@test.com', 'mortimr2');
    const conflictSignedPayload = await web3RegisterSigner.sign(other_wallet.privateKey, conflictRegisterPayload[1]);

    try {
        await sdk.web3Register('test2@test.com', 'mortimr2', conflictRegisterPayload[0], wallet.address, conflictSignedPayload.hex)
        expect(0).to.equal(5);
    } catch (e) {
        if (!e.response) throw e;
        expect(e.response).to.containSubset({
            data: {
                message: 'address_already_in_use',
                statusCode: 409,
                name: 'Conflict',
            },
            statusText: 'Conflict',
            status: 409,
        })
    }

    const third_wallet = await createWallet();
    const future = Date.now() + 1000000;
    const future_email = 'megatron3000@gmail.com';
    const future_username = 'Xx_i_come_from_the_future_xX';

    const future_payload = web3RegisterSigner.generatePayload({
        timestamp: future,
        email: future_email,
        username: future_username,
    }, 'Web3Register');
    const future_signature = await web3RegisterSigner.sign(third_wallet.privateKey, future_payload);

    try {
        await sdk.web3Register(future_email, future_username, future, third_wallet.address, future_signature.hex);
        expect(0) .to.equal(6);
    } catch (e) {
        expect(e.response).to.containSubset({
            data: {
                message: 'signature_is_in_the_future',
                statusCode: 401,
                name: 'Unauthorized',
            },
            statusText: 'Unauthorized',
            status: 401,
        })
    }

    const past = Date.now() - 1000000;
    const past_email = 'ouk_ouk@gmail.com';
    const past_username = 'prehistoric8627';

    const past_payload = web3RegisterSigner.generatePayload({
        timestamp: past,
        email: past_email,
        username: past_username,
    }, 'Web3Register');
    const past_signature = await web3RegisterSigner.sign(third_wallet.privateKey, past_payload);

    try {
        await sdk.web3Register(past_email, past_username, past, third_wallet.address, past_signature.hex);
        expect(0).to.equal(7);
    } catch (e) {
        expect(e.response).to.containSubset({
            data: {
                message: 'signature_timed_out',
                statusCode: 401,
                name: 'Unauthorized',
            },
            statusText: 'Unauthorized',
            status: 401,
        })
    }

    try {
        await sdk.web3Login(loginPayload[0], signedLoginPayload.hex);
        expect(0).to.equal(8);
    } catch (e) {
        expect(e.response).to.containSubset({
            data: {
                message: 'duplicate_token_usage',
                statusCode: 401,
                name: 'Unauthorized',
            },
            statusText: 'Unauthorized',
            status: 401,
        })
    }

    try {
        await sdk.web3Login(loginPayload[0] - 1, signedLoginPayload.hex);
        expect(0).to.equal(9);
    } catch (e) {
        expect(e.response).to.containSubset({
            data: {
                message: 'invalid_signature',
                statusCode: 401,
                name: 'Unauthorized',
            },
            statusText: 'Unauthorized',
            status: 401,
        })
    }

    const past_login_payload = web3LoginSigner.generatePayload({
        timestamp: past
    }, 'Web3Login');
    const past_login_signature = await web3LoginSigner.sign(wallet.privateKey, past_login_payload);

    try {
        await sdk.web3Login(past, past_login_signature.hex);
        expect(0).to.equal(9);
    } catch (e) {
        expect(e.response).to.containSubset({
            data: {
                message: 'signature_timed_out',
                statusCode: 401,
                name: 'Unauthorized',
            },
            statusText: 'Unauthorized',
            status: 401,
        })
    }

    const future_login_payload = web3LoginSigner.generatePayload({
        timestamp: future
    }, 'Web3Login');
    const future_login_signature = await web3LoginSigner.sign(wallet.privateKey, future_login_payload);

    try {
        await sdk.web3Login(future, future_login_signature.hex);
        expect(0).to.equal(9);
    } catch (e) {
        expect(e.response).to.containSubset({
            data: {
                message: 'signature_is_in_the_future',
                statusCode: 401,
                name: 'Unauthorized',
            },
            statusText: 'Unauthorized',
            status: 401,
        })
    }
}

