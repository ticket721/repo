import { ActionSet }            from '@lib/common/actionsets/helper/ActionSet.class';
import { DateEntity }           from '@lib/common/dates/entities/Date.entity';
import { EventEntity }          from '@lib/common/events/entities/Event.entity';
import { CurrenciesService }    from '@lib/common/currencies/Currencies.service';
import { types }                from '@iaminfinity/express-cassandra';
import { CategoryEntity }       from '@lib/common/categories/entities/Category.entity';
import { EventCreationActions } from '@lib/common/events/acset_builders/EventCreate.acsetbuilder.helper';

/**
 * Convert categories to saveable format
 *
 * @param tscope
 * @param groupID
 * @param currenciesService
 * @param categories
 * @param parentId
 * @param parentType
 */
async function convertCategories(
    tscope: string,
    groupID: string,
    currenciesService: CurrenciesService,
    categories: any[],
    parentId: any,
    parentType: string,
): Promise<CategoryEntity[]> {
    const catret: CategoryEntity[] = [];

    for (const category of categories) {
        const pricesResolverRes = await currenciesService.resolveInputPrices(category.currencies);

        if (pricesResolverRes.error) {
            throw new Error(`Invalid input prices`);
        }

        catret.push({
            group_id: groupID,
            category_name: category.serializedName,
            display_name: category.name,
            sale_begin: category.saleBegin,
            sale_end: category.saleEnd,
            resale_begin: category.resaleBegin,
            resale_end: category.resaleEnd,
            scope: tscope,
            prices: pricesResolverRes.response,
            seats: category.seats,
            parent_id: parentId,
            parent_type: parentType,
        } as CategoryEntity);
    }

    return catret;
}

/**
 * Convert Dates to saveable format
 *
 * @param tscope
 * @param eventUUID
 * @param groupID
 * @param actionset
 * @param currenciesService
 * @param uuidGenerator
 */
async function convertDates(
    tscope: string,
    eventUUID: string,
    groupID: string,
    actionset: ActionSet,
    currenciesService: CurrenciesService,
    uuidGenerator: () => string,
): Promise<[Partial<DateEntity>, Partial<CategoryEntity>[]][]> {
    const returnValue: [Partial<DateEntity>, Partial<CategoryEntity>[]][] = [];

    for (let idx = 0; idx < actionset.actions[EventCreationActions.DatesConfiguration].data.dates.length; ++idx) {
        const date = actionset.actions[EventCreationActions.DatesConfiguration].data.dates[idx];
        const categories = actionset.actions[EventCreationActions.CategoriesConfiguration].data.dates[idx];
        const uuid = types.Uuid.fromString(uuidGenerator());

        const parsedCategories = await convertCategories(tscope, groupID, currenciesService, categories, uuid, 'date');

        const dateEntity: Partial<DateEntity> = {
            id: uuid.toString(),
            group_id: groupID,
            timestamps: {
                event_begin: date.eventBegin,
                event_end: date.eventEnd,
            },
            metadata: {
                name: actionset.actions[EventCreationActions.TextMetadata].data.name,
                description: actionset.actions[EventCreationActions.TextMetadata].data.description,
                avatar: actionset.actions[EventCreationActions.ImagesMetadata].data.avatar,
                tags: actionset.actions[EventCreationActions.TextMetadata].data.tags,
                signature_colors: actionset.actions[EventCreationActions.ImagesMetadata].data.signatureColors,
            },
            location: {
                assigned_city: date.city.id,
                location: {
                    lon: date.location.lon,
                    lat: date.location.lat,
                },
                location_label: date.location.label,
            },
            parent_id: types.Uuid.fromString(eventUUID) as any,
            parent_type: 'event',
            categories: parsedCategories.map((e: CategoryEntity): string => e.id),
            status: 'preview',
        };

        returnValue.push([dateEntity, parsedCategories]);
    }

    return returnValue;
}

/**
 * Convert Event to saveable format
 *
 * @param tscope
 * @param eventUUID
 * @param groupID
 * @param address
 * @param actionset
 * @param currenciesService
 * @param owner
 */
async function convertEvent(
    tscope: string,
    eventUUID: string,
    groupID: string,
    address: string,
    actionset: ActionSet,
    currenciesService: CurrenciesService,
    owner: string,
): Promise<[Partial<EventEntity>, Partial<CategoryEntity>[]]> {
    const eventEntity: Partial<EventEntity> = {};

    eventEntity.id = types.Uuid.fromString(eventUUID) as any;
    const parsedEntities: Partial<CategoryEntity>[] = await convertCategories(
        tscope,
        groupID,
        currenciesService,
        actionset.actions[EventCreationActions.CategoriesConfiguration].data.global,
        eventEntity.id,
        'event',
    );
    eventEntity.name = actionset.actions[EventCreationActions.TextMetadata].data.name;
    eventEntity.address = address;
    eventEntity.dates = [];
    eventEntity.controller = address;
    eventEntity.categories = [];
    eventEntity.group_id = groupID;

    return [eventEntity, parsedEntities];
}

/**
 * Convert event creation ActionSet into "preview" Event
 *
 * @param tscope
 * @param groupID
 * @param eventUUID
 * @param address
 * @param actionset
 * @param currenciesService
 * @param owner
 * @param uuidGenerator
 * @constructor
 */
export async function ActionSetToEventEntityConverter(
    tscope: string,
    groupID: string,
    eventUUID: string,
    address: string,
    actionset: ActionSet,
    currenciesService: CurrenciesService,
    owner: string,
    uuidGenerator: () => string,
): Promise<[Partial<EventEntity>, [Partial<DateEntity>, Partial<CategoryEntity>[]][], Partial<CategoryEntity>[]]> {
    const dateEntities: [Partial<DateEntity>, Partial<CategoryEntity>[]][] = await convertDates(
        tscope,
        eventUUID,
        groupID,
        actionset,
        currenciesService,
        uuidGenerator,
    );

    const eventEntity: [Partial<EventEntity>, Partial<CategoryEntity>[]] = await convertEvent(
        tscope,
        eventUUID,
        groupID,
        address,
        actionset,
        currenciesService,
        owner,
    );

    eventEntity[0].dates = dateEntities[0].map((e: DateEntity): string => e.id);

    return [eventEntity[0], dateEntities, eventEntity[1]];
}
