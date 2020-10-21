import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';

describe('Ticket Entity', function() {
    describe('constructor', function() {
        it('should build from nothing', function() {
            const ticketEntity = new TicketEntity();

            expect(ticketEntity).toEqual({});
        });

        it('should build from raw entity', function() {
            const rawTicketEntity: TicketEntity = {
                id: 'ticket_id',
                receipt: 'receipt_id',
                owner: '0xaddress',
                category: 'category_id',
                group_id: 'group_id',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const ticketEntity = new TicketEntity(rawTicketEntity);

            expect(ticketEntity).toEqual(rawTicketEntity);
        });

        it('should build from raw entity with null id', function() {
            const rawTicketEntity: TicketEntity = {
                id: null,
                receipt: null,
                owner: '0xaddress',
                category: null,
                group_id: 'group_id',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const ticketEntity = new TicketEntity(rawTicketEntity);

            expect(ticketEntity).toEqual(rawTicketEntity);
        });
    });
});
