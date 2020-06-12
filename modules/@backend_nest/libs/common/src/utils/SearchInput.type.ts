import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';

export type SearchInputType<EntityType> = {
    readonly [P in keyof EntityType]: SearchableField<EntityType[P]>;
} &
    SortablePagedSearch;
