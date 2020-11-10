import { ErrorNode } from '@common/global';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Data model returned
 */
export class DatesAddCategoryResponseDto {
    /**
     * Possible errors due to category creation
     */
    error?: ErrorNode;

    /**
     * Newly created category
     */
    category?: CategoryEntity;
}
