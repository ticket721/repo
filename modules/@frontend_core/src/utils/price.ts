export const formatEuro = (rawPrice: number | string): string => {
    if (typeof rawPrice === 'string') {
        rawPrice = parseInt(rawPrice, 10);
    }

    let formattedPrice = (rawPrice / 100).toString().replace('.', ',');
    if (rawPrice.toString().match(/0$/)) {
        formattedPrice = formattedPrice.concat('0');
    }

    return formattedPrice + ' €';
};
