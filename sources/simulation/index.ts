import config                       from './config';
import { Wallet }                   from 'ethers';
import { createWallet, RefractMtx } from '@ticket721sources/global';
import * as fs                      from 'fs';
import { T721SDK }                  from '@ticket721sources/sdk';
import { AxiosResponse }            from 'axios';
import FormData                     from 'form-data';
import { UserDto }                  from '../server/libs/common/src/users/dto/User.dto';

const loadWallet = async (path: string): Promise<Wallet> => {
    if (fs.existsSync(path)) {
        const walletJson = require(path);
        return new Wallet(walletJson.pk);
    } else {
        const wallet = await createWallet();
        fs.writeFileSync(path, JSON.stringify({ pk: wallet.privateKey }, null, 4));
        return wallet;
    }
};

const waitForAction = async (sdk: T721SDK, token: string, actionset: string): Promise<any> => {
    let tries = 0;
    return new Promise((ok, ko): void => {

        const intervalId = setInterval(async () => {

            if (tries === 30) {
                clearInterval(intervalId);
                return ko(new Error('Maximum attempts reached'));
            }

            tries += 1;

            const res = await sdk.actions.search(token, { id: { $eq: actionset } });

            if (res.data.actionsets.length === 0) {
                return;
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
                        return ko({
                            current_status: actionSetEntity.current_status,
                            error: actionSetEntity.actions[actionSetEntity.current_action].error,
                        });
                }
            }

        }, 1000);

    });
};

export const createEvent = async (user: UserDto, wallet: Wallet, sdk: T721SDK, token: string, event: string, imagesPath: string): Promise<void> => {
    console.log(`Deploying Test Event with ID: ${event}`);

    const infos = require(`./events/${event}/info`).default;
    let id;

    {
        console.log('Create Event: ...');
        const res = await sdk.events.create.init(
            token,
            {
                name: infos.name,
            },
        );
        console.log('Create Event: OK.');

        id = res.data.actionset.id;
    }

    console.log('Create Event - Text Metadata: ...');
    await sdk.events.create.textMetadata(
        token,
        id,
        {
            name: infos.name,
            description: infos.description,
            tags: infos.tags,
        },
    );
    await waitForAction(sdk, token, id);
    console.log('Create Event - Text Metadata: OK.');


    console.log('Create Event - Modules Configuration: ...');
    await sdk.events.create.modulesConfiguration(
        token,
        id,
        {},
    );
    await waitForAction(sdk, token, id);
    console.log('Create Event - Modules Configuration: OK.');


    console.log('Create Event - Dates Configuration: ...');
    await sdk.events.create.datesConfiguration(
        token,
        id,
        {
            dates: infos.dates,
        },
    );
    await waitForAction(sdk, token, id);
    console.log('Create Event - Dates Configuration: OK.');


    console.log('Create Event - Categories Configuration: ...');
    await sdk.events.create.categoriesConfiguration(
        token,
        id,
        infos.categories,
    );
    await waitForAction(sdk, token, id);
    console.log('Create Event - Categories Configuration: OK.');


    let avatarId = null;
    let bannerIds = null;

    {
        const form = new FormData();

        form.append('images', fs.readFileSync(`${imagesPath}/${infos.images.avatar}`), {
            filename: 'avatar.jpg',
        });

        console.log('Create Event - Avatar Upload: ...');
        const res = await sdk.images.upload(
            token,
            form.getBuffer(),
            form.getHeaders(),
        );
        console.log('Create Event - Avatar Upload: OK.');

        avatarId = res.data.ids[0].id;

    }

    {
        const form = new FormData();

        for (const banner of infos.images.banners) {

            form.append('images', fs.readFileSync(`${imagesPath}/${banner}`), {
                filename: 'banner.jpg',
            });
        }

        console.log('Create Event - Banners Upload: ...');
        const res = await sdk.images.upload(
            token,
            form.getBuffer(),
            form.getHeaders(),
        );
        console.log('Create Event - Banners Upload: OK.');

        bannerIds = res.data.ids.map(img => img.id);

    }

    console.log('Create Event - Images Metadata: ...');
    await sdk.events.create.imagesMetadata(
        token,
        id,
        {
            avatar: avatarId,
            banners: bannerIds,
        },
    );
    await waitForAction(sdk, token, id);
    console.log('Create Event - Images Metadata: OK.');


    console.log('Create Event - Admins Configuration: ...');
    await sdk.events.create.adminsConfiguration(
        token,
        id,
        {
            admins: infos.admins,
        },
    );
    await waitForAction(sdk, token, id);
    console.log('Create Event - Admins Configuration: OK.');


    console.log(`Created Event ${event} with action set id ${id}`);

    console.log('Create Event - Build: ...');
    const resultingEvent = await sdk.events.create.build(token, {
        completedActionSet: id,
    });
    console.log('Create Event - Build: OK.');

    console.log('Create Event - Generate Payload: ...');
    const eventDeployPayload = await sdk.events.deploy.generatePayload(token, resultingEvent.data.event.id);
    console.log('Create Event - Generate Payload: OK.');

    const payload = eventDeployPayload.data.payload;
    const refractSigner = new RefractMtx(2702, 'Refract Wallet', '0', user.address);
    const signature = await refractSigner.sign(wallet.privateKey, payload);

    console.log('Create Event - Deploy: ...');
    await sdk.events.deploy.run(
        token,
        {
            payload,
            signature: signature.hex,
            event: resultingEvent.data.event.id,
        },
    );
    console.log('Create Event - Deploy: OK.');

};

const eventCreator = async (sdk: T721SDK, token: string, user: UserDto, wallet: Wallet): Promise<void> => {
    await createEvent(user, wallet, sdk, token, 'justice', './events/justice/images');
};

const main = async (): Promise<void> => {
    const wallet = await loadWallet(config.wallet);

    const sdk = new T721SDK();
    sdk.connect(config.host, config.port, config.protocol as 'http' | 'https');

    let token;
    let user;

    try {
        const res = await sdk.localLogin(config.email, config.password);
        console.log('Logged In');
        console.log('Token', res.data.token);
        token = res.data.token;
        user = res.data.user;
    } catch (e) {
        console.log('Cannot Login: Creating Account');
        if (e.response.status === 401) {
            const res: AxiosResponse = await sdk.localRegister(config.email, config.password, 'tester', wallet, null, 'en') as AxiosResponse;
            await sdk.validateEmail(res.data.validationToken);
            token = res.data.token;
            user = res.data.user;
        }
    }

    console.log('Controller ', wallet.address);

    await eventCreator(sdk, token, user, wallet);

};

if (require.main === module) {
    main().catch((e: any): void => {
        console.error(e);
        console.log(e.config.data);
        if (e.response && e.response.data) {
            console.error(JSON.stringify(e.response.data));
        }
    });
}

