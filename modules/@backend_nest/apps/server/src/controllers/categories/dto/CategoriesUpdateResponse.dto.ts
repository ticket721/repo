import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Data model returned when updating a category
 */
export class CategoriesUpdateResponseDto {
    /**
     * Category updated
     */
    category: CategoryEntity;
}
