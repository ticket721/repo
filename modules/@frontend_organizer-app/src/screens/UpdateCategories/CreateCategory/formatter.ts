import { CategoryWithDatesPayload } from '@common/global';
import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';

export const formatCategoryEntity = (category: CategoryEntity, dates: number[]): CategoryWithDatesPayload => ({
    dates,
    name: category.display_name,
    saleBegin: category.sale_begin,
    saleEnd: category.sale_end,
    seats: category.seats,
    price: category.price / 100,
    currency: category.currency,
});
