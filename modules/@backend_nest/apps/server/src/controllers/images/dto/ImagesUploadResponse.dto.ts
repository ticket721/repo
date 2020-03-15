import { ImageEntity } from '@lib/common/images/entities/Image.entity';

/**
 * Data Model returned after images upload
 */
export class ImagesUploadResponseDto {
    /**
     * IDs of uploaded files
     */
    ids: ImageEntity[];
}
