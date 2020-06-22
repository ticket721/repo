const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export default {
    nonce: 1,
    admins: [],
    name: 'Booba Tour 2020 Album Trone Titre Long :(',
    description: 'Booba Concert',
    tags: ['french', 'rap', 'trap'],
    dates: [
        {
            name: 'Mairie de Bagnolet',
            eventBegin: new Date(Date.now() + DAY),
            eventEnd: new Date(Date.now() + 2 * DAY),
            location: {
                label: 'Mairie de Bagnolet',
                lat: 48.8687314,
                lon: 2.4169252
            }
        },
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
                        price: '20000'
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
                            price: '10000'
                        }
                    ]
                }
            ],
        ]
    },
    images: {
        avatar: 'avatar.jpg',
        signatureColors: [
            '#4e061a',
            '#2a2a2b'
        ]
    }
}
