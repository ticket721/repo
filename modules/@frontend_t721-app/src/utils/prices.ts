import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { symbolOf }       from '@common/global';

const categoryPriceString = (category: CategoryEntity, free: string, quantity: number = 1): string => {
    if (category.currency === 'FREE' || category.currency === null) {
        return free;
    }

    return `${(category.price * quantity) / 100} ${symbolOf(category.currency)}`
}

export const getPrice = (category: CategoryEntity, free: string, quantity: number = 1): string => {

    return categoryPriceString(category, free, quantity);

}

export const getLowestPrice = (categories: CategoryEntity[], fallback: string, free: string): string => {
    if (categories.length === 0) {
        return fallback;
    }

    let minimum = 0

    for (let idx = 0; idx < categories.length; ++idx) {
        const category = categories[idx];

        if (category.price < categories[minimum].price) {
            minimum = idx;
        }
    }

    return categoryPriceString(categories[minimum], free);

}

export const getPriceRange = (categories: CategoryEntity[], fallback: string, free: string): string => {
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

        return categoryPriceString(categories[minimum], free);

    } else {

        return `${categoryPriceString(categories[minimum], free)} - ${categoryPriceString(categories[maximum], free)}`;

    }


}
