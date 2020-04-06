import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { DatesRepository } from '@lib/common/dates/Dates.repository';
import { DatesService } from '@lib/common/dates/Dates.service';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { DatesRightsConfig } from '@lib/common/dates/Dates.rights';

/**
 * Dates Modules. Lowest level of the event
 */
@Module({
    imports: [CategoriesModule, ExpressCassandraModule.forFeature([DateEntity, DatesRepository])],
    providers: [
        {
            provide: `@rights/date`,
            useValue: DatesRightsConfig,
        },
        DatesService,
    ],
    exports: [DatesService],
})
export class DatesModule {}
