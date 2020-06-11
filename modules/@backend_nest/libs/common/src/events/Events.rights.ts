import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights Config of the event scope
 */
export const EventsRightsConfig: RightsConfig = {
    owner: {
        count: 1,
        countAs: ['admin'],
    },
    admin: {
        countAs: [
            'route_update_metadata',
            'route_add_categories',
            'route_delete_categories',
            'route_add_dates',
            'route_delete_dates',
            'metadata_all',
            'withdraw',
        ],
    },
    route_search: {
        public: true,
    },
    route_create: {
        public: true,
    },
    route_update_metadata: {
        countAs: ['metadata_write_history'],
    },
    route_add_categories: {
        countAs: ['metadata_write_history'],
    },
    route_delete_categories: {
        countAs: ['metadata_write_history'],
    },
    route_add_dates: {
        countAs: ['metadata_write_history'],
    },
    route_delete_dates: {
        countAs: ['metadata_write_history'],
    },
    withdraw: {},

    metadata_all: {},

    metadata_read_all: {},
    metadata_write_all: {},

    metadata_write_history: {},
    metadata_read_history: {},
};
