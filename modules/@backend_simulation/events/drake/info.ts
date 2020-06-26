const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export default {
    nonce: 1,
    admins: [],
    name: 'Drake Scorpion Tour',
    description: 'Drake Concert',
    tags: ['canadian', 'rap', 'rnb'],
    dates: [
        {
            name: 'Times Square',
            eventBegin: new Date(Date.now() + DAY),
            eventEnd: new Date(Date.now() + DAY + 2 * HOUR),
            location: {
                label: 'Times Square',
                lat: 40.758896,
                lon: -73.985130
            }
        },
        {
            name: 'Times Square',
            eventBegin: new Date(Date.now() + 2 * DAY),
            eventEnd: new Date(Date.now() + 2 * DAY + 2 * HOUR),
            location: {
                label: 'Times Square',
                lat: 40.758896,
                lon: -73.985130
            }
        },
    ],
    categories: {
        global: [],
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
            []
        ]
    },
    images: {
        avatar: 'avatar.jpg',
        signatureColors: [
            '#f7f3ff',
            '#616261'
        ]
    }
}
