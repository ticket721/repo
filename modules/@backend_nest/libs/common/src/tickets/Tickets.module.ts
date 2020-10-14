import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import { TicketsRepository } from '@lib/common/tickets/Tickets.repository';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { MetadatasModule } from '@lib/common/metadatas/Metadatas.module';
import { UsersModule } from '@lib/common/users/Users.module';
import { RightsModule } from '@lib/common/rights/Rights.module';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([TicketEntity, TicketsRepository]),
        CategoriesModule,
        MetadatasModule,
        RightsModule,
        UsersModule,
    ],
    providers: [TicketsService],
    exports: [TicketsService],
})
export class TicketsModule {}
