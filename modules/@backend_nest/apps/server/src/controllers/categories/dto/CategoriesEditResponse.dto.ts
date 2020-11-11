import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Data model returned when editing a category
 */
export class CategoriesEditResponseDto {
    /**
     * Updated category entity
     */
    category: CategoryEntity;
}
