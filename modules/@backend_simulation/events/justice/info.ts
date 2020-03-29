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
        }
    ],
    categories: {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() + HOUR),
                saleEnd: new Date(Date.now() + 23 * HOUR),
                resaleBegin: new Date(Date.now() + HOUR),
                resaleEnd: new Date(Date.now() + 23 * HOUR),
                seats: 100,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '100'
                    }
                ]
            }
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() + HOUR),
                    saleEnd: new Date(Date.now() + 23 * HOUR),
                    resaleBegin: new Date(Date.now() + HOUR),
                    resaleEnd: new Date(Date.now() + 23 * HOUR),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '100'
                        }
                    ]
                }
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() + HOUR),
                    saleEnd: new Date(Date.now() + 23 * HOUR),
                    resaleBegin: new Date(Date.now() + HOUR),
                    resaleEnd: new Date(Date.now() + 23 * HOUR),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '100'
                        }
                    ]
                }
            ]
        ]
    },
    images: {
        avatar: 'avatar.jpg'
    }
}
