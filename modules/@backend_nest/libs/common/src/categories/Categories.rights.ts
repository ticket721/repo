import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights Config for the category scope
 */
export const CategoriesRightsConfig: RightsConfig = {
    owner: {
        count: 1,
        can_edit_rights: true,
        countAs: ['admin'],
    },
    admin: {
        countAs: ['route_update', 'route_create', 'metadata_all'],
    },
    route_update: {
        countAs: ['metadata_write_history'],
    },
    route_create: {
        countAs: ['metadata_write_history'],
    },
    route_search: {
        public: true,
    },

    metadata_all: {},

    metadata_read_all: {},
    metadata_write_all: {},

    metadata_write_history: {},
    metadata_read_history: {},
};
