import config                          from './config';
import {Wallet}                        from 'ethers';
import { createWallet, encryptWallet } from '@ticket721sources/global';
import * as fs                         from 'fs';
import {T721SDK}                       from '@ticket721sources/sdk';
import { AxiosResponse }               from 'axios';

const loadWallet = async (path: string): Promise<Wallet> => {
    if (fs.existsSync(path)) {
        const walletJson = require(path);
        return new Wallet(walletJson.pk);
    } else {
        const wallet = await createWallet();
        fs.writeFileSync(path, JSON.stringify({pk: wallet.privateKey}, null, 4));
        return wallet;
    }
};

const waitForAction = async (sdk: T721SDK, token: string, actionset: string): Promise<void> => {
    let tries = 0;
    return new Promise((ok, ko): void => {

        const intervalId = setInterval(async () => {

            if (tries === 30) {
                clearInterval(intervalId);
                return ko(new Error('Maximum attempts reached'));
            }

            tries += 1;

            const res = await sdk.actions.search(token, {id: {$eq: actionset}});

            if (res.data.actionsets.length === 0) {
                return ;
            }

            const actionSetEntity = res.data.actionsets[0];
            if (actionSetEntity.current_status !== 'input:waiting' && actionSetEntity.current_status !== 'event:waiting') {
                clearInterval(intervalId);
                switch (actionSetEntity.current_status) {
                    case 'complete':
                    case 'event:in progress':
                    case 'input:in progress':
                        return ok(actionSetEntity.current_status);
                    case 'error':
                    case 'input:error':
                    case 'event:error':
                        return ko(actionSetEntity.current_status);
                }
            }

        }, 1000);

    });
}

const createEvent = async (sdk: T721SDK, token: string, event: string): Promise<void> => {
    console.log(`Deploying Test Event with ID: ${event}`);

    const infos = require(`./events/${event}/info`).default;

    const res = await sdk.events.create(
        token,
        {
            name: infos.name,
        }
    );

    const id = res.data.actionset.id;

    await sdk.actions.update(
        token,
        {
            actionset_id: id,
            data: {
                name: infos.name,
                description: infos.description,
                tags: infos.tags,
            }
        }
    );

    await waitForAction(sdk, token, id);

    await sdk.actions.update(
        token,
        {
            actionset_id: id,
            data: {}
        }
    );

    await waitForAction(sdk, token, id);

    await sdk.actions.update(
        token,
        {
            actionset_id: id,
            data: {
                dates: infos.dates,
            }
        }
    );

    await waitForAction(sdk, token, id);

    console.log('hehe');

    console.log(infos);
};

const eventCreator = async (sdk: T721SDK, token: string): Promise<void> => {
    const justiceEvent = await createEvent(sdk, token, 'justice');
};

const main = async (): Promise<void> => {
    const wallet = await loadWallet(config.wallet);

    const sdk = new T721SDK();
    sdk.connect(config.host, config.port, config.protocol as 'http' | 'https');

    let token;

    try {
        const res = await sdk.localLogin(config.email, config.password);
        console.log('Logged In');
        token = res.data.token;
    } catch (e) {
        console.log('Cannot Login: Creating Account');
        if (e.response.status === 401) {
            const res: AxiosResponse = await sdk.localRegister(config.email, config.password, 'tester', wallet, () => {}, 'en') as AxiosResponse;
            await sdk.validateEmail(res.data.validationToken);
            token = res.data.token;
        }
    }

    await eventCreator(sdk, token);

};

main().catch((e: any): void => {
    console.error(e);
    if (e.response && e.response.data) {
        console.error(JSON.stringify(e.response.data));
    }
});

