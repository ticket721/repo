import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Data model returned when searching for categories
 */
export class CategoriesSearchResponseDto {
    /**
     * Returned Category
     */
    categories: CategoryEntity[];
}
