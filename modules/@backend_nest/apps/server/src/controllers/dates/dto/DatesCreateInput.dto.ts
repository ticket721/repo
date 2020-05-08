import { DateEntity, DateMetadata, DateTimestamps, InputDateLocation } from '@lib/common/dates/entities/Date.entity';
import { IsHexadecimal, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when creating a new date
 */
export class DatesCreateInputDto implements Pick<DateEntity, 'group_id' | 'timestamps' | 'metadata'> {
    /**
     * Date Group ID
     */
    @ApiProperty({
        description: 'Group ID to use',
    })
    @IsHexadecimal()
    @Length(66, 66)
    // tslint:disable-next-line:variable-name
    group_id: string;

    /**
     * Date Location
     */
    @ApiProperty({
        description: 'Location of the date',
    })
    @ValidateNested()
    @Type(() => InputDateLocation)
    location: InputDateLocation;

    /**
     * Date timestamps info
     */
    @ApiProperty({
        description: 'Timestamps of the date',
    })
    @ValidateNested()
    @Type(() => DateTimestamps)
    timestamps: DateTimestamps;

    /**
     * Date metadata
     */
    @ApiProperty({
        description: 'Metadata of the date',
    })
    @ValidateNested()
    @Type(() => DateMetadata)
    metadata: DateMetadata;
}
