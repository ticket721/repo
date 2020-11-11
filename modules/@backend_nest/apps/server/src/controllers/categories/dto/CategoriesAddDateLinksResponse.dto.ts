import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Date model returned after the new date links have been created
 */
export class CategoriesAddDateLinksResponseDto {
    /**
     * Updated category entity
     */
    category: CategoryEntity;
}
