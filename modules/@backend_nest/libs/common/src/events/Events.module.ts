import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { EventsRepository } from '@lib/common/events/Events.repository';
import { EventsService } from '@lib/common/events/Events.service';
import { DatesModule } from '@lib/common/dates/Dates.module';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { EventsRightsConfig } from '@lib/common/events/Events.rights';
import { EventCreateAcsetbuilderHelper } from '@lib/common/events/acset_builders/EventCreate.acsetbuilder.helper';

/**
 * Events Module
 */
@Module({
    imports: [DatesModule, CategoriesModule, ExpressCassandraModule.forFeature([EventEntity, EventsRepository])],
    providers: [
        EventsService,

        {
            provide: `ACTION_SET_BUILDER/event_create`,
            useClass: EventCreateAcsetbuilderHelper,
        },

        {
            provide: '@rights/event',
            useValue: EventsRightsConfig,
        },
    ],
    exports: [EventsService],
})
export class EventsModule {}
