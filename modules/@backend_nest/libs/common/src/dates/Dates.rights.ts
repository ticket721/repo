import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights Config for the date scope
 */
export const DatesRightsConfig: RightsConfig = {
    owner: {
        count: 1,
        can_edit_rights: true,
        countAs: ['admin'],
    },
    admin: {
        countAs: ['route_create', 'route_add_categories', 'route_delete_categories', 'route_update', 'metadata_all'],
    },
    route_create: {
        countAs: ['metadata_write_history'],
    },
    route_search: {
        public: true,
    },
    route_add_categories: {
        countAs: ['metadata_write_history'],
    },
    route_delete_categories: {
        countAs: ['metadata_write_history'],
    },
    route_update: {
        countAs: ['metadata_write_history'],
    },

    metadata_all: {},

    metadata_read_all: {},
    metadata_write_all: {},

    metadata_write_history: {},
    metadata_read_history: {},
};
