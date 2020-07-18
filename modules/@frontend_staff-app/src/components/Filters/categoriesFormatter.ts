import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { CategoryItem }       from '../../redux/ducks/current_event';

export const formatCategories = (categories: CategoryEntity[]): CategoryItem[] =>
    categories.map(category => ({
        id: category.id,
        name: category.display_name,
        global: category.parent_type === 'event',
    }));
