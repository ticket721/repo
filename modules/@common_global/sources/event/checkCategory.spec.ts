import { checkCategory, CategoryCreationPayload } from './checkCategory';

describe('checkCategory', function() {

    it('should fail on invalid Joi validation', function() {

        const event: Partial<CategoryCreationPayload> = {
            name: 'hi',
        };

        const error = checkCategory(event as CategoryCreationPayload);

        expect(error).toEqual(

            {
                "name": {
                    "reasons": [
                        {
                            "type": "string.min",
                            "context": {
                                "limit": 3,
                                "value": "hi",
                                "label": "name",
                                "key": "name"
                            }
                        }
                    ]
                }
            }

        );

    });

    it('should validate payload', function() {

        const now = new Date();

        const category: CategoryCreationPayload = {
            name: 'All Inclusive',
            saleBegin: now,
            saleEnd: new Date(now.getTime() + 3000000),
            seats: 100,
            price: 200,
            currency: 'eur'
        };

        const error = checkCategory(category);

        expect(error).toEqual(null);

    });

    it('should fail on invalid sale dates', function() {

        const now = new Date();

        const event: CategoryCreationPayload = {
            name: 'All Inclusive',
            saleEnd: now,
            saleBegin: new Date(now.getTime() + 3000000),
            seats: 100,
            price: 200,
            currency: 'zouzou'
        };

        const error = checkCategory(event);

        expect(error).toEqual(
            {
                "saleEnd": {
                    "reasons": [
                        {
                            "type": "categoryEntity.saleEndBeforeStart",
                            "context": {
                                "end": now,
                                "start": new Date(now.getTime() + 3000000)
                            }
                        }
                    ]
                }
            }
        );

    });

    it('should fail on invalid currency', function() {

        const now = new Date();

        const event: CategoryCreationPayload = {
            name: 'All Inclusive',
            saleBegin: now,
            saleEnd: new Date(now.getTime() + 3000000),
            seats: 100,
            price: 200,
            currency: 'zouzou'
        };

        const error = checkCategory(event);

        expect(error).toEqual(
            {
                "currency": {
                    "reasons": [
                        {
                            "type": "categoryEntity.invalidCurrency",
                            "context": {
                                "currency": "ZOUZOU"
                            }
                        }
                    ]
                }
            }
        );

    });

});
