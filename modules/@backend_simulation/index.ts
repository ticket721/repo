import config            from './config';
import * as fs           from 'fs';
import { T721SDK }       from '@common/sdk';
import { AxiosResponse } from 'axios';
import FormData          from 'form-data';
import { UserDto }       from '../@backend_nest/libs/common/src/users/dto/User.dto';

export const createEvent = async (user: UserDto, sdk: T721SDK, token: string, event: string, imagesPath: string): Promise<void> => {
    console.log(`Deploying Test Event with ID: ${event}: ...`);

    const infos = require(`./events/${event}/info`).default;

    let avatarUrl = null;

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

        avatarUrl = res.data.urls[0];

    }

    const eventRes = await sdk.events.create.create(
        token,
        {
            eventPayload: {
                textMetadata: {
                    name: infos.name,
                    description: infos.description
                },
                imagesMetadata: {
                    avatar: avatarUrl,
                    signatureColors: infos.images.signatureColors
                },
                datesConfiguration: [
                    ...infos.dates.map((date: any) => ({
                        name: date.name,
                        eventBegin: date.eventBegin,
                        eventEnd: date.eventEnd,
                        online: date.online || false,
                        online_link: date.online_link,
                        location: date.online ? undefined : date.location
                    }))
                ],
                categoriesConfiguration: [
                    ...(infos.categories.global.map((gcat: any) => (
                        {
                            name: gcat.name,
                            dates: gcat.dates,
                            saleBegin: gcat.saleBegin,
                            saleEnd: gcat.saleEnd,
                            seats: gcat.seats,
                            price: gcat.price,
                            currency: gcat.currency
                        }
                    ))),
                    ...infos.categories.dates
                        .map((date, dateIdx) =>
                            infos.categories.dates[dateIdx].map((cat) => ({
                                name: cat.name,
                                dates: [dateIdx],
                                saleBegin: cat.saleBegin,
                                saleEnd: cat.saleEnd,
                                seats: cat.seats,
                                price: cat.price,
                                currency: cat.currency
                            }))
                        )
                        .reduce((prev, next) => prev.concat(next))
                ]

            }
        })

    // const liveEvent = await sdk.events.start(token, {
    //     event: resultingEvent.data.event.id
    // });

    if (eventRes.data.error) {
        console.error(JSON.stringify(eventRes.data.error, null, 4))
    } else {
        console.log(eventRes.data.event);
        console.log(`Deploying Test Event with ID: ${event}: OK.`);
    }

};

const eventCreator = async (sdk: T721SDK, token: string, user: UserDto): Promise<void> => {
    await createEvent(user, sdk, token, 'justice', './events/justice/images');
    await createEvent(user, sdk, token, 'booba', './events/booba/images');
    await createEvent(user, sdk, token, 'drake', './events/drake/images');
};

const main = async (): Promise<void> => {
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
            const res: AxiosResponse = await sdk.localRegister(config.email, config.password, 'tester', 'en') as AxiosResponse;
            await sdk.validateEmail(res.data.validationToken);
            token = res.data.token;
            user = res.data.user;
        }
    }

    await eventCreator(sdk, token, user);

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

