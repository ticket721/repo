import { CurrenciesService, ERC20Currency } from '@lib/common/currencies/Currencies.service';
import { toB32 } from '@common/global';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Amount of categories per transaction
 */
const CATEGORIES_PACK_SIZE = 10;

/**
 * Encode categories as arguments for the T721Controller
 *
 * @param validationAddress
 * @param currenciesService
 * @param categories
 */
export async function encodeCategories(
    validationAddress: string,
    currenciesService: CurrenciesService,
    categories: CategoryEntity[],
): Promise<[string[], string[], string[]][]> {
    const ret: [string[], string[], string[]][] = [];

    for (let idx = 0; idx < Math.ceil(categories.length / CATEGORIES_PACK_SIZE); ++idx) {
        const encoded: [string[], string[], string[]] = [[], [], []];
        const subcategories = categories.slice(CATEGORIES_PACK_SIZE * idx, CATEGORIES_PACK_SIZE * (idx + 1));

        for (const category of subcategories) {
            encoded[0].push(category.seats.toString());
            encoded[0].push(Math.floor(category.sale_begin.getTime() / 1000).toString());
            encoded[0].push(Math.floor(category.sale_end.getTime() / 1000).toString());
            encoded[0].push(Math.floor(category.resale_begin.getTime() / 1000).toString());
            encoded[0].push(Math.floor(category.resale_end.getTime() / 1000).toString());
            encoded[0].push(category.prices.length.toString());

            encoded[1].push(validationAddress);
            encoded[1].push(validationAddress);

            for (const price of category.prices) {
                const currency: ERC20Currency = (await currenciesService.get(price.currency)) as ERC20Currency;
                encoded[1].push(currency.address);
                encoded[0].push(price.value);
            }

            encoded[2].push(toB32(category.category_name));
            encoded[2].push(toB32(''));
        }

        ret.push(encoded);
    }

    return ret;
}
