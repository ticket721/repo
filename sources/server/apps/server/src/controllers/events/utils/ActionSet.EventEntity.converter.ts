import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { Category, DateEntity, Price } from '@lib/common/dates/entities/Date.entity';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { CurrenciesService, ERC20Currency, SetCurrency } from '@lib/common/currencies/Currencies.service';
import { Decimal } from 'decimal.js';

enum EventCreationActions {
    TextMetadata,
    ModulesConfiguration,
    DatesConfiguration,
    CategoriesConfiguration,
    ImagesMetadata,
    AdminsConfiguration,
}

/**
 * Utility to recover all used currencies and convert Sets into ERC20
 *
 * @param currenciesService
 * @param name
 * @param met
 */
async function resolveCurrencies(
    currenciesService: CurrenciesService,
    name: string,
    met: { [key: string]: boolean },
): Promise<string[]> {
    const currency = await currenciesService.get(name);
    let currencies = [];

    switch (currency.type) {
        case 'set': {
            const setCurrency: SetCurrency = currency as SetCurrency;
            for (const curr of setCurrency.contains) {
                if (met[curr] === true) {
                    continue;
                }

                currencies = [...currencies, ...(await resolveCurrencies(currenciesService, curr, met))];

                met[curr] = true;
            }

            break;
        }
        case 'erc20': {
            const erc20Currency: ERC20Currency = currency as ERC20Currency;

            if (met[erc20Currency.name] === true) {
                break;
            }

            currencies.push(erc20Currency.name);

            met[erc20Currency.name] = true;

            break;
        }
    }

    currencies = currencies.filter((curr: string, pos: number): boolean => currencies.indexOf(curr) === pos);

    return currencies;
}

/**
 * Convert prices to savable entities
 *
 * @param tscope
 * @param currenciesService
 * @param prices
 */
async function convertPrices(tscope: string, currenciesService: CurrenciesService, prices: any[]): Promise<Price[]> {
    let total: { currency: string; price: string }[] = [];
    const ret: Price[] = [];

    for (const curr of prices) {
        total = [
            ...total,
            ...(await resolveCurrencies(currenciesService, curr.currency, {})).map((curname: string) => ({
                currency: curname,
                price: curr.price,
            })),
        ];
    }

    total = total.filter(
        (curr: { currency: string; price: string }, pos: number): boolean =>
            total.findIndex((elem: { currency: string; price: string }) => elem.currency === curr.currency) === pos,
    );

    for (const currency of total) {
        const loadedCurrency = await currenciesService.get(currency.currency);
        if (loadedCurrency === undefined) {
            throw new Error(`invalid currency ${currency}`);
        }
        ret.push({
            currency: currency.currency,
            value: currency.price,
            log_value: Decimal.log2(currency.price).toNumber(),
        });
    }

    return ret;
}

/**
 * Convert categories to saveable format
 *
 * @param tscope
 * @param currenciesService
 * @param categories
 */
async function convertCategories(
    tscope: string,
    currenciesService: CurrenciesService,
    categories: any[],
): Promise<Category[]> {
    const ret: Category[] = [];

    for (let catidx = 0; catidx < categories.length; ++catidx) {
        ret.push({
            group_id: null,
            category_name: categories[catidx].name,
            category_index: catidx,
            sale_begin: categories[catidx].saleBegin,
            sale_end: categories[catidx].saleEnd,
            resale_begin: categories[catidx].resaleBegin,
            resale_end: categories[catidx].resaleEnd,
            scope: tscope,
            status: 'preview',
            prices: await convertPrices(tscope, currenciesService, categories[catidx].currencies),
            seats: categories[catidx].seats,
        });
    }

    return ret;
}

/**
 * Convert Dates to saveable format
 *
 * @param tscope
 * @param actionset
 * @param currenciesService
 */
async function convertDates(
    tscope: string,
    actionset: ActionSet,
    currenciesService: CurrenciesService,
): Promise<Partial<DateEntity>[]> {
    const dateEntities: Partial<DateEntity>[] = [];

    for (let idx = 0; idx < actionset.actions[EventCreationActions.DatesConfiguration].data.dates.length; ++idx) {
        const date = actionset.actions[EventCreationActions.DatesConfiguration].data.dates[idx];
        const categories = actionset.actions[EventCreationActions.CategoriesConfiguration].data.dates[idx];

        dateEntities.push({
            event_begin: date.eventBegin,
            event_end: date.eventEnd,
            assigned_city: date.city.id,
            location: {
                lon: date.location.lon,
                lat: date.location.lat,
            },
            location_label: date.location.label,
            metadata: {
                name: date.name,
            },
            parent_id: null,
            parent_type: null,
            categories: await convertCategories(tscope, currenciesService, categories),
        });
    }

    return dateEntities;
}

/**
 * Convert Event to saveable format
 *
 * @param tscope
 * @param actionset
 * @param currenciesService
 * @param owner
 */
async function convertEvent(
    tscope: string,
    actionset: ActionSet,
    currenciesService: CurrenciesService,
    owner: string,
): Promise<Partial<EventEntity>> {
    const eventEntity: Partial<EventEntity> = {};

    eventEntity.name = actionset.actions[EventCreationActions.TextMetadata].data.name;
    eventEntity.description = actionset.actions[EventCreationActions.TextMetadata].data.description;
    eventEntity.status = 'preview';
    eventEntity.address = null;
    eventEntity.owner = owner;
    eventEntity.admins = actionset.actions[EventCreationActions.AdminsConfiguration].data.admins;
    eventEntity.dates = [];
    eventEntity.categories = await convertCategories(
        tscope,
        currenciesService,
        actionset.actions[EventCreationActions.CategoriesConfiguration].data.global,
    );
    eventEntity.avatar = actionset.actions[EventCreationActions.ImagesMetadata].data.avatar;
    eventEntity.banners = actionset.actions[EventCreationActions.ImagesMetadata].data.banners;

    return eventEntity;
}

/**
 * Convert event creation ActionSet into "preview" Event
 *
 * @param tscope
 * @param actionset
 * @param currenciesService
 * @param owner
 * @constructor
 */
export async function ActionSetToEventEntityConverter(
    tscope: string,
    actionset: ActionSet,
    currenciesService: CurrenciesService,
    owner: string,
): Promise<[Partial<DateEntity>[], Partial<EventEntity>]> {
    const dateEntities: Partial<DateEntity>[] = await convertDates(tscope, actionset, currenciesService);
    const eventEntity: Partial<EventEntity> = await convertEvent(tscope, actionset, currenciesService, owner);

    return [dateEntities, eventEntity];
}
