import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Model for the images upload
 */
export class ImagesUploadInputDto {
    /**
     * Images uploaded
     */
    @ApiProperty({
        type: 'string',
        format: 'binary',
        isArray: true,
    })
    images: any[];
}
