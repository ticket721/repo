import { ApiProperty } from '@nestjs/swagger';

export class ImagesUploadInputDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        isArray: true,
    })
    images: any[];
}
