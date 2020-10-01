import { checkEvent, EventCreationPayload } from './index';

describe('checkEvent', function() {

    it('should fail on invalid Joi validation (name length)', function() {

        const event: Partial<EventCreationPayload> = {
            textMetadata: {
                name: 'hi',
                description: 'bye'
            }
        };

        const error = checkEvent(event as EventCreationPayload);

        expect(error).toEqual({
            textMetadata: {
                name: {
                    reasons: [
                        {
                            "context":{
                                "encoding": undefined,
                                "key": "name",
                                "label": "textMetadata.name",
                                "limit": 3,
                                "value": "hi",
                            },
                            "type": "string.min",
                        }
                    ]
                }
            }
        })

    });

    it('should fail on invalid Joi validation (name missing required)', function() {

        const event: Partial<EventCreationPayload> = {
            textMetadata: {
                name: 'hi dude',
                description: 'bye'
            }
        };

        const error = checkEvent(event as EventCreationPayload);

        expect(error).toEqual({
            imagesMetadata: {
                reasons: [

                    {
                        "context": {
                            "key": "imagesMetadata",
                            "label": "imagesMetadata",
                        },
                        "type": "any.required",
                    },

                ]
            }
        })

    });

    it('should validate payload', function() {

        const now = new Date();

        const event: EventCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linkedIn: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            datesConfiguration: [
                {
                    name: 'Jeudi',
                    eventBegin: new Date(now.getTime() + 1000000),
                    eventEnd: new Date(now.getTime() + 2000000),
                    online: false,
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                },
                {
                    name: 'Vendredi',
                    eventBegin: new Date(now.getTime() + 2000000),
                    eventEnd: new Date(now.getTime() + 3000000),
                    online: true,
                    liveLink: 'https://twitch.tv/kamet0',
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                }
            ],
            categoriesConfiguration: [
                {
                    name: 'All Inclusive',
                    dates: [0, 1],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 3000000),
                    seats: 100,
                    price: 200,
                    currency: 'eur'
                },
                {
                    name: 'Free Pass',
                    dates: [0],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 2000000),
                    seats: 1000,
                    price: 0,
                    currency: 'FREE'
                }
            ]
        };

        const error = checkEvent(event);

        expect(error).toEqual(null);

    });

    it('should fail on empty dates', function() {

        const now = new Date();

        const event: EventCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linkedIn: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            datesConfiguration: [],
            categoriesConfiguration: [
                {
                    name: 'All Inclusive',
                    dates: [0, 1],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 3000000),
                    seats: 100,
                    price: 200,
                    currency: 'eur'
                },
                {
                    name: 'Free Pass',
                    dates: [0],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 2000000),
                    seats: 1000,
                    price: 0,
                    currency: 'FREE'
                }
            ]
        };

        const error = checkEvent(event);

        expect(error).toEqual({
            "datesConfiguration": {"reasons": [{"context": {"key": "datesConfiguration", "label": "datesConfiguration", "limit": 1, "value": []}, "type": "dateEntity.min"}]}
        });

    });

    it('should fail on invalid date dates', function() {

        const now = new Date();

        const event: EventCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linkedIn: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            datesConfiguration: [
                {
                    name: 'Jeudi',
                    eventBegin: new Date(now.getTime() + 2000000),
                    eventEnd: new Date(now.getTime() + 3000000),
                    online: false,
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                },
                {
                    name: 'Vendredi',
                    eventBegin: new Date(now.getTime() + 2000000),
                    eventEnd: new Date(now.getTime() + 1000000),
                    online: true,
                    liveLink: 'https://twitch.tv/kamet0',
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                }
            ],
            categoriesConfiguration: [
                {
                    name: 'All Inclusive',
                    dates: [0, 1],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 3000000),
                    seats: 100,
                    price: 200,
                    currency: 'eur'
                },
                {
                    name: 'Free Pass',
                    dates: [0],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 2000000),
                    seats: 1000,
                    price: 0,
                    currency: 'FREE'
                }
            ]
        };

        const error = checkEvent(event);

        expect(error).toEqual({
            "datesConfiguration": [undefined, {"eventEnd": {"reasons": [{"context": {"end": new Date(now.getTime() + 1000000), "start": new Date(now.getTime() + 2000000)}, "type": "dateEntity.endBeforeStart"}]}}]
        });

    });

    it('should fail on invalid category dates', function() {

        const now = new Date();

        const event: EventCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linkedIn: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            datesConfiguration: [
                {
                    name: 'Jeudi',
                    eventBegin: new Date(now.getTime() + 1000000),
                    eventEnd: new Date(now.getTime() + 2000000),
                    online: false,
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                },
                {
                    name: 'Vendredi',
                    eventBegin: new Date(now.getTime() + 2000000),
                    eventEnd: new Date(now.getTime() + 3000000),
                    online: true,
                    liveLink: 'https://twitch.tv/kamet0',
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                }
            ],
            categoriesConfiguration: [
                {
                    name: 'All Inclusive',
                    dates: [0, 1],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() - 3000000),
                    seats: 100,
                    price: 200,
                    currency: 'eur'
                },
                {
                    name: 'Free Pass',
                    dates: [0],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 2000000),
                    seats: 1000,
                    price: 0,
                    currency: 'FREE'
                }
            ]
        };

        const error = checkEvent(event);

        expect(error).toEqual({
            "categoriesConfiguration": [{"saleEnd": {"reasons": [{"context": {"end": new Date(now.getTime() - 3000000), "start": now}, "type": "categoryEntity.saleEndBeforeStart"}]}}]
        });

    });

    it('should fail on invalid date idx on category', function() {

        const now = new Date();

        const event: EventCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linkedIn: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            datesConfiguration: [
                {
                    name: 'Jeudi',
                    eventBegin: new Date(now.getTime() + 1000000),
                    eventEnd: new Date(now.getTime() + 2000000),
                    online: false,
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                },
                {
                    name: 'Vendredi',
                    eventBegin: new Date(now.getTime() + 2000000),
                    eventEnd: new Date(now.getTime() + 3000000),
                    online: true,
                    liveLink: 'https://twitch.tv/kamet0',
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                }
            ],
            categoriesConfiguration: [
                {
                    name: 'All Inclusive',
                    dates: [0, 2],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 3000000),
                    seats: 100,
                    price: 200,
                    currency: 'eur'
                },
                {
                    name: 'Free Pass',
                    dates: [0],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 2000000),
                    seats: 1000,
                    price: 0,
                    currency: 'FREE'
                }
            ]
        };

        const error = checkEvent(event);

        expect(error).toEqual({
            "categoriesConfiguration": [{"dates": [undefined, {"reasons": [{"context": {}, "type": "categoryEntity.invalidDateIndex"}]}]}]
        });

    });

    it('should fail on unlinked category', function() {

        const now = new Date();

        const event: EventCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linkedIn: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            datesConfiguration: [
                {
                    name: 'Jeudi',
                    eventBegin: new Date(now.getTime() + 1000000),
                    eventEnd: new Date(now.getTime() + 2000000),
                    online: false,
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                },
                {
                    name: 'Vendredi',
                    eventBegin: new Date(now.getTime() + 2000000),
                    eventEnd: new Date(now.getTime() + 3000000),
                    online: true,
                    liveLink: 'https://twitch.tv/kamet0',
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                }
            ],
            categoriesConfiguration: [
                {
                    name: 'All Inclusive',
                    dates: [0, 1],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 3000000),
                    seats: 100,
                    price: 200,
                    currency: 'eur'
                },
                {
                    name: 'Free Pass',
                    dates: [],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 2000000),
                    seats: 1000,
                    price: 0,
                    currency: 'FREE'
                }
            ]
        };

        const error = checkEvent(event);

        expect(error).toEqual({
            "categoriesConfiguration": [undefined, {"dates": {"reasons": [{"context": {}, "type": "categoryEntity.noDateLinked"}]}}]
        });

    });

    it('should fail on sale end after date end', function() {

        const now = new Date();

        const event: EventCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linkedIn: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            datesConfiguration: [
                {
                    name: 'Jeudi',
                    eventBegin: new Date(now.getTime() + 1000000),
                    eventEnd: new Date(now.getTime() + 2000000),
                    online: false,
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                },
                {
                    name: 'Vendredi',
                    eventBegin: new Date(now.getTime() + 2000000),
                    eventEnd: new Date(now.getTime() + 3000000),
                    online: true,
                    liveLink: 'https://twitch.tv/kamet0',
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                }
            ],
            categoriesConfiguration: [
                {
                    name: 'All Inclusive',
                    dates: [0, 1],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 3000001),
                    seats: 100,
                    price: 200,
                    currency: 'eur'
                },
                {
                    name: 'Free Pass',
                    dates: [0],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 2000000),
                    seats: 1000,
                    price: 0,
                    currency: 'FREE'
                }
            ]
        };

        const error = checkEvent(event);

        expect(error).toEqual({
            "categoriesConfiguration": [{"saleEnd": {"reasons": [{"context": {"eventEnd": new Date(now.getTime() + 3000000), "saleEnd": new Date(now.getTime() + 3000001)}, "type": "categoryEntity.saleEndAfterLastEventEnd"}]}}]
        });

    });

    it('should fail on unexisting currency', function() {

        const now = new Date();

        const event: EventCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linkedIn: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            datesConfiguration: [
                {
                    name: 'Jeudi',
                    eventBegin: new Date(now.getTime() + 1000000),
                    eventEnd: new Date(now.getTime() + 2000000),
                    online: false,
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                },
                {
                    name: 'Vendredi',
                    eventBegin: new Date(now.getTime() + 2000000),
                    eventEnd: new Date(now.getTime() + 3000000),
                    online: true,
                    liveLink: 'https://twitch.tv/kamet0',
                    location: {
                        lat: 0.234,
                        lon: 2.345,
                        label: '49 rue des rues'
                    }
                }
            ],
            categoriesConfiguration: [
                {
                    name: 'All Inclusive',
                    dates: [0, 1],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 3000000),
                    seats: 100,
                    price: 200,
                    currency: 'zouzou'
                },
                {
                    name: 'Free Pass',
                    dates: [0],
                    saleBegin: now,
                    saleEnd: new Date(now.getTime() + 2000000),
                    seats: 1000,
                    price: 0,
                    currency: 'FREE'
                }
            ]
        };

        const error = checkEvent(event);

        expect(error).toEqual({
            "categoriesConfiguration": [{"currency": {"reasons": [{"context": {"currency": "zouzou"}, "type": "categoryEntity.invalidCurrency"}]}}]
        });

    });

});
