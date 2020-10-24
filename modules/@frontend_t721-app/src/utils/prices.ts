import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { symbolOf }       from '@common/global';

const categoryPriceString = (category: CategoryEntity): string => {
    if (category.currency === 'FREE') {
        return 'FREE'
    }

    return `${category.price / 100} ${symbolOf(category.currency)}`
}

export const getPriceRange = (categories: CategoryEntity[], fallback: string): string => {
    if (categories.length === 0) {
        return fallback;
    }

    let minimum = 0
    let maximum = 0;

    for (let idx = 0; idx < categories.length; ++idx) {
        const category = categories[idx];

        if (category.price < categories[minimum].price) {
            minimum = idx;
        } else if (category.price > categories[maximum].price) {
            maximum = idx;
        }
    }

    if (minimum === maximum) {

        return categoryPriceString(categories[minimum]);

    } else {

        return `${categoryPriceString(categories[minimum])} - ${categoryPriceString(categories[maximum])}`;

    }


}
