import { ErrorNode } from '@common/global';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

export class DatesAddCategoryResponseDto {
    error?: ErrorNode;
    category?: CategoryEntity;
}
