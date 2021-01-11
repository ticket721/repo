import { format } from '@common/global';

interface PriceInfo {
    currency: string;
    price: number;
}

const priceInfoPriceString = (priceInfo: PriceInfo, free: string, quantity: number = 1): string => {
    if (priceInfo.currency === 'FREE' || priceInfo.currency === null) {
        return free;
    }

    return format(priceInfo.currency, priceInfo.price * quantity);
};

export const getPrice = (priceInfo: PriceInfo, free: string, quantity: number = 1): string => {
    return priceInfoPriceString(priceInfo, free, quantity);
};

export const getLowestPrice = (categories: PriceInfo[], fallback: string, free: string): string => {
    if (categories.length === 0) {
        return fallback;
    }

    let minimum = 0;

    for (let idx = 0; idx < categories.length; ++idx) {
        const priceInfo = categories[idx];

        if (priceInfo.price < categories[minimum].price) {
            minimum = idx;
        }
    }

    return priceInfoPriceString(categories[minimum], free);
};

export const getPriceRange = (categories: PriceInfo[], fallback: string, free: string): string => {
    if (categories.length === 0) {
        return fallback;
    }

    let minimum = 0;
    let maximum = 0;

    for (let idx = 0; idx < categories.length; ++idx) {
        const priceInfo = categories[idx];

        if (priceInfo.price < categories[minimum].price) {
            minimum = idx;
        } else if (priceInfo.price > categories[maximum].price) {
            maximum = idx;
        }
    }

    if (minimum === maximum) {
        return priceInfoPriceString(categories[minimum], free);
    } else {
        return `${priceInfoPriceString(categories[minimum], free)} - ${priceInfoPriceString(
            categories[maximum],
            free,
        )}`;
    }
};
