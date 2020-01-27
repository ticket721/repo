export default {
    name: "Justice Woman WorldWide 2020",
    description: "Justice Concert",
    tags: ["french", "electro", "disco"],
    dates: [
        {
            name: 'La Cigale',
            eventBegin: new Date(Date.now() + 24 * 60 * 60 * 1000),
            eventEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            location: {
                label: '120 Boulevard de Rochechouart, 75018 Paris',
                lat: 48.882301,
                lon: 2.340150
            }
        },
        {
            name: 'Bataclan',
            eventBegin: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            eventEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
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
                name: 'vip',
                resaleBegin: new Date(Date.now()),
                resaleEnd: new Date(Date.now() + 23 * 60 * 60 * 1000),
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
                    name: 'regular',
                    resaleBegin: new Date(Date.now()),
                    resaleEnd: new Date(Date.now() + 23 * 60 * 60 * 1000),
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
                    name: 'regular',
                    resaleBegin: new Date(Date.now()),
                    resaleEnd: new Date(Date.now() + 23 * 60 * 60 * 1000),
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
        avatar: 'avatar.jpg',
        banners: [
            'banner_one.jpg',
            'banner_two.jpg'
        ]
    }
}
