import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { DatesRepository } from '@lib/common/dates/Dates.repository';
import { DatesService } from '@lib/common/dates/Dates.service';

/**
 * Dates Modules. Lowest level of the event
 */
@Module({
    imports: [ExpressCassandraModule.forFeature([DateEntity, DatesRepository])],
    providers: [DatesService],
    exports: [DatesService],
})
export class DatesModule {}
