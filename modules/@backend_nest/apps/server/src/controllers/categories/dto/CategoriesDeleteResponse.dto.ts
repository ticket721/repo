import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Data model returned when deleting a category
 */
export class CategoriesDeleteResponseDto {
    /**
     * Updated category entity
     */
    category: CategoryEntity | null;
}
