import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';

describe('Ticket Entity', function() {

    describe('constructor', function () {

        it('should build from nothing', function () {

            const ticketEntity = new TicketEntity();

            expect(ticketEntity).toEqual({});

        });

        it('should build from raw entity', function () {

            const rawTicketEntity: TicketEntity = {
                id: 'ticket_id',
                address: '0xaddress',
                env: 'chain',
                status: 'minting',
                transaction_hash: '0xhash',
                category: 'category_id',
                group_id: 'group_id',
                parent_id: 'parent_id',
                parent_type: 'event',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now())
            };

            const ticketEntity = new TicketEntity(rawTicketEntity);

            expect(ticketEntity).toEqual(rawTicketEntity);

        });

        it('should build from raw entity with null id', function () {

            const rawTicketEntity: TicketEntity = {
                id: 'ticket_id',
                address: '0xaddress',
                env: 'chain',
                status: 'minting',
                transaction_hash: '0xhash',
                category: null,
                group_id: 'group_id',
                parent_id: null,
                parent_type: 'event',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now())
            };

            const ticketEntity = new TicketEntity(rawTicketEntity);

            expect(ticketEntity).toEqual(rawTicketEntity);

        });

    });

});
