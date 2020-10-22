import { EventEntity } from '@lib/common/events/entities/Event.entity';

describe('Event Entity', function() {
    describe('constructor', function() {
        it('should build event entity from nothing', function() {
            const eventEntity = new EventEntity();

            expect(eventEntity).toEqual({});
        });

        it('should build event entity from raw event entity', function() {
            const rawEventEntity = {
                id: 'abcd',
                group_id: 'abcd',
                owner: 'abcd',
                name: 'event name',
                address: '0xaddress',
                controller: 'controller name',
                dates: [],
                status: 'preview',
                created_at: new Date(),
                updated_at: new Date(),
                stripe_interface: 'stripe_interface_id',
                signature_colors: ['#ff0000', '#00ff00'],
                custom_static_fee: 0,
                custom_percent_fee: 0,
                avatar: 'https://avatar.com',
                description: 'desc',
            } as EventEntity;

            const eventEntity = new EventEntity(rawEventEntity);

            expect(eventEntity).toEqual(rawEventEntity);
        });

        it('should build event entity from raw event entity with null id', function() {
            const rawEventEntity = {
                id: null,
                group_id: 'abcd',
                name: 'event name',
                owner: null,
                address: '0xaddress',
                controller: 'controller name',
                dates: [],
                status: 'preview',
                created_at: new Date(),
                updated_at: new Date(),
                stripe_interface: null,
                signature_colors: ['#ff0000', '#00ff00'],
                custom_static_fee: 0,
                custom_percent_fee: 0,
                avatar: 'https://avatar.com',
                description: 'desc',
            } as EventEntity;

            const eventEntity = new EventEntity(rawEventEntity);

            expect(eventEntity).toEqual(rawEventEntity);
        });
    });
});
