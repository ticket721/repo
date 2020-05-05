import { Module }           from '@nestjs/common';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { DatesModule }      from '@lib/common/dates/Dates.module';
import { EventsModule }     from '@lib/common/events/Events.module';
import { GroupService }     from '@lib/common/group/Group.service';

@Module({
    imports: [
        CategoriesModule,
        DatesModule,
        EventsModule
    ],
    providers: [
        GroupService
    ],
    exports: [
        GroupService
    ]
})
export class GroupModule {

}
