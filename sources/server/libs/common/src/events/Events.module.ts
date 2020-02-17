import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { EventsRepository } from '@lib/common/events/Events.repository';
import { EventsService } from '@lib/common/events/Events.service';

/**
 * Events Module
 */
@Module({
    imports: [
        ExpressCassandraModule.forFeature([EventEntity, EventsRepository]),
    ],
    providers: [EventsService],
    exports: [EventsService],
})
export class EventsModule {}
