import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { ArrayMinSize, IsHexColor, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model required when updating an event
 */
export class EventsEditInputDto implements Partial<Pick<EventEntity, 'avatar' | 'name' | 'description'>> {
    /**
     * Event avatar url
     */
    @ApiPropertyOptional({
        description: 'Event avatar',
    })
    @IsUrl()
    @IsOptional()
    avatar?: string;

    /**
     * Event name
     */
    @ApiPropertyOptional({
        description: 'Event name',
    })
    @MinLength(3)
    @MaxLength(50)
    @IsString()
    @IsOptional()
    name?: string;

    /**
     * Event signature colors
     */
    @ApiPropertyOptional({
        description: 'Signature colors',
    })
    @IsHexColor({ each: true })
    @ArrayMinSize(2)
    // tslint:disable-next-line:variable-name
    signature_colors?: [string, string];

    /**
     * Event description
     */
    @ApiPropertyOptional({
        description: 'Event description',
    })
    @MaxLength(10000)
    @IsString()
    @IsOptional()
    description?: string;
}
