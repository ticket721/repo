import { checkDate, DateCreationPayload } from './checkDate';

describe('checkDate', function() {

    it('should fail on invalid Joi validation (name length)', function() {

        const event: Partial<DateCreationPayload> = {
            textMetadata: {
                name: 'hi',
                description: 'bye'
            }
        };

        const error = checkDate(event as DateCreationPayload);

        expect(error).toHaveProperty('textMetadata', {
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
        });

    });

    it('should fail on invalid Joi validation (info missing required)', function() {

        const event: Partial<DateCreationPayload> = {
            textMetadata: {
                name: 'hi dude',
                description: 'bye'
            }
        };

        const error = checkDate(event as DateCreationPayload);

        expect(error).toHaveProperty('info', {
            "reasons": [
                {
                    "type": "any.required",
                    "context": {
                        "label": "info",
                        "key": "info"
                    }
                }
            ]
        });

    });

    it('should validate payload', function() {

        const now = new Date();

        const event: DateCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linked_in: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com',
                instagram: 'ticket721'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            info: {
                name: 'Jeudi',
                eventBegin: new Date(now.getTime() + 1000000),
                eventEnd: new Date(now.getTime() + 2000000),
                online: false,
                location: {
                    lat: 0.234,
                    lon: 2.345,
                    label: '49 rue des rues'
                }
            }
        };

        const error = checkDate(event);

        expect(error).toEqual(null);

    });

    it('should fail on invalid dates', function() {

        const now = new Date();

        const event: DateCreationPayload = {
            textMetadata: {
                name: 'My Test Event',
                description: 'This is my test event !',
                twitter: 'ticket721',
                facebook: 'https://facebook.com/ticket721',
                linked_in: 'https://linkedin.com/ticket721',
                website: 'https://ticket721.com',
                email: 'contact@ticket721.com',
                instagram: 'ticket721'
            },
            imagesMetadata: {
                avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                signatureColors: ['#0000ff', '#ff0000']
            },
            info: {
                name: 'Jeudi',
                eventBegin: new Date(now.getTime() + 3000000),
                eventEnd: new Date(now.getTime() + 2000000),
                online: false,
                location: {
                    lat: 0.234,
                    lon: 2.345,
                    label: '49 rue des rues'
                }
            }
        };

        const error = checkDate(event);

        expect(error).toEqual(
            {
                "info": {
                    "eventEnd": {
                        "reasons": [
                            {
                                "type": "dateEntity.endBeforeStart",
                                "context": {
                                    "start": new Date(now.getTime() + 3000000),
                                    "end": new Date(now.getTime() + 2000000)
                                }
                            }
                        ]
                    }
                }
            }
        );

    });

});
