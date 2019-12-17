import { T721SDK }              from '@ticket721sources/sdk';
import ExpectStatic = Chai.ExpectStatic;
import { Wallet, createWallet } from '@ticket721sources/global';

export async function register(): Promise<void> {
    const { sdk, expect }: { sdk: T721SDK, expect: ExpectStatic } = this;

    const wallet: Wallet = await createWallet();
    const password = 'xqd65g87sh76_98d-';

    const reg_res = await sdk.localRegister('test@test.com', password, 'mortimr', wallet, () => {});
    const auth_res = await sdk.localLogin('test@test.com', password);
}
