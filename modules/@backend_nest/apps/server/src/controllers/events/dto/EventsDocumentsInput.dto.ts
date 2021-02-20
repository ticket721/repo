import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Input required when generate the documents for an event
 */
export class EventsDocumentsInputDto {
    /**
     * Organizer name
     */
    @ApiProperty({
        description: 'Organizer name',
    })
    @IsString()
    organizerName: string;

    /**
     * Organizer street
     */
    @ApiProperty({
        description: 'Organizer street',
    })
    @IsString()
    organizerStreet: string;

    /**
     * Organizer city
     */
    @ApiProperty({
        description: 'Organizer city',
    })
    @IsString()
    organizerCity: string;

    /**
     * Organizer postal code
     */
    @ApiProperty({
        description: 'Organizer postal code',
    })
    @IsString()
    organizerPostalCode: string;

    /**
     * Organizer country
     */
    @ApiProperty({
        description: 'Organizer country',
    })
    @IsString()
    organizerCountry: string;

    /**
     * Organizer license id
     */
    @ApiProperty({
        description: 'Organizer license',
    })
    @IsString()
    organizerLicenseId: string;

    /**
     * Organizer TVA ID
     */
    @ApiProperty({
        description: 'Organizer TVA id',
    })
    @IsString()
    organizerTvaId: string;

    /**
     * Organizer TVA
     */
    @ApiProperty({
        description: 'Organizer TVA',
    })
    @IsNumber()
    organizerTva: number;
}
