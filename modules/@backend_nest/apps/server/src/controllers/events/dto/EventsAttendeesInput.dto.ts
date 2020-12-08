import { IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when fetching attendees list
 */
export class EventsAttendeesInputDto {
    /**
     * Filter by categories
     */
    @ApiProperty({
        description: 'Categories of tickets to fetch',
    })
    @IsUUID('4', { each: true })
    categories?: string[];

    /**
     * Amount of results required
     */
    @ApiProperty({
        description: 'Amount of tickets to fetch',
    })
    @IsNumber()
    // tslint:disable-next-line:variable-name
    page_size: number;

    /**
     * Current page (does page_size * pagenumber) offseting
     */
    @ApiProperty({
        description: 'Page number',
    })
    @IsNumber()
    // tslint:disable-next-line:variable-name
    page_number: number;
}
