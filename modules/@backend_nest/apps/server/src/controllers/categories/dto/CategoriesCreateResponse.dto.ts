import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Date model returned when creating a new category
 */
export class CategoriesCreateResponseDto {
    /**
     * Created category
     */
    category: CategoryEntity;
}
