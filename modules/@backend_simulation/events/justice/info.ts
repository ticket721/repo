const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export default {
    nonce: 1,
    admins: [],
    name: 'Justice Woman WorldWide 2020',
    description: 'Justice Concert',
    tags: ['french', 'electro', 'disco'],
    dates: [
        {
            name: 'La Cigale',
            eventBegin: new Date(Date.now() + DAY),
            eventEnd: new Date(Date.now() + 2 * DAY),
            location: {
                label: '120 Boulevard de Rochechouart, 75018 Paris',
                lat: 48.882301,
                lon: 2.340150
            }
        },
        {
            name: 'Bataclan',
            eventBegin: new Date(Date.now() + 4 * DAY),
            eventEnd: new Date(Date.now() + 5 * DAY),
            location: {
                label: '50 Boulevard Voltaire, 75011 Paris',
                lat: 48.863110,
                lon: 2.370870
            }
        },
        {
            name: 'Online',
            online: true,
            online_link: 'https://twitch.tv/justice',
            eventBegin: new Date(Date.now() + 5 * DAY),
            eventEnd: new Date(Date.now() + 6 * DAY),
        }
    ],
    categories: {
        global: [
            {
                name: 'pre-VIP Tickets',
                saleBegin: new Date(Date.now()),
                saleEnd: new Date(Date.now() + 23 * HOUR),
                seats: 5,
                price: 1000,
                currency: 'eur',
                dates: [0, 1]
            },
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() + HOUR),
                saleEnd: new Date(Date.now() + 23 * HOUR),
                seats: 100,
                price: 20000,
                currency: 'eur',
                dates: [1, 2]
            }
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() + 30 * SECOND),
                    saleEnd: new Date(Date.now() + 23 * HOUR),
                    seats: 200,
                    price: 0,
                    currency: 'FREE',
                },
                {
                    name: 'Super Tickets',
                    saleBegin: new Date(Date.now() + HOUR),
                    saleEnd: new Date(Date.now() + 23 * HOUR),
                    seats: 200,
                    price: 15000,
                    currency: 'eur',
                },
                {
                    name: 'Hyper Tickets',
                    saleBegin: new Date(Date.now() + 30 * SECOND),
                    saleEnd: new Date(Date.now() + 31 * SECOND),
                    seats: 200,
                    price: 30000,
                    currency: 'eur',
                }
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() + 30 * SECOND),
                    saleEnd: new Date(Date.now() + 23 * HOUR),
                    seats: 200,
                    price: 10000,
                    currency: 'eur'
                },
                {
                    name: 'Super Tickets',
                    saleBegin: new Date(Date.now() + HOUR),
                    saleEnd: new Date(Date.now() + 23 * HOUR),
                    seats: 200,
                    price: 15000,
                    currency: 'eur'
                },
                {
                    name: 'Hyper Tickets',
                    saleBegin: new Date(Date.now() + 30 * SECOND),
                    saleEnd: new Date(Date.now() + 31 * SECOND),
                    seats: 200,
                    price: 30000,
                    currency: 'eur'
                }
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() + 30 * SECOND),
                    saleEnd: new Date(Date.now() + 23 * HOUR),
                    seats: 200,
                    price: 10000,
                    currency: 'eur'
                },
                {
                    name: 'Super Tickets',
                    saleBegin: new Date(Date.now() + HOUR),
                    saleEnd: new Date(Date.now() + 23 * HOUR),
                    seats: 200,
                    price: 15000,
                    currency: 'eur'
                },
                {
                    name: 'Hyper Tickets',
                    saleBegin: new Date(Date.now() + 30 * SECOND),
                    saleEnd: new Date(Date.now() + 31 * SECOND),
                    seats: 200,
                    price: 30000,
                    currency: 'eur'
                }
            ]
        ]
    },
    images: {
        avatar: 'avatar.jpg',
        signatureColors: [
            '#FAE2B2',
            '#57472F'
        ]
    }
}
