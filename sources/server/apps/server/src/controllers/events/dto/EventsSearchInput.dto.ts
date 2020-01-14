import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class EventsSearchInputDto extends SortablePagedSearch {
    @ApiPropertyOptional({
        description: 'Unique ID of the Date',
    })
    @IsOptional()
    @IsObject()
    id?: SearchableField<string>;

    @ApiPropertyOptional({
        description: 'Name of the event',
    })
    @IsOptional()
    @IsObject()
    name?: SearchableField<string>;
}
