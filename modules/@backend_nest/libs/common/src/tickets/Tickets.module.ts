import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import { TicketsRepository } from '@lib/common/tickets/Tickets.repository';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { PurchasesModule } from '@lib/common/purchases/Purchases.module';
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';

@Module({
    imports: [ExpressCassandraModule.forFeature([TicketEntity, TicketsRepository]), PurchasesModule, ToolBoxModule],
    providers: [TicketsService],
    exports: [TicketsService],
})
export class TicketsModule {}
