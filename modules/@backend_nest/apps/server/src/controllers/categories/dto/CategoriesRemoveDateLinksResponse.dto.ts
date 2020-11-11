import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Data model returned when removing dates links from a category
 */
export class CategoriesRemoveDateLinksResponseDto {
    /**
     * Updated category entity
     */
    category: CategoryEntity;
}
