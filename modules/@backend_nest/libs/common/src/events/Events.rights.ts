import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights Config of the event scope
 */
export const EventsRightsConfig: RightsConfig = {
    owner: {
        count: 1,
    },
    admin: {},
    route_search: {
        public: true,
    },
    route_create: {
        public: true,
    },
    route_update_metadata: {},
    route_add_categories: {},
    route_delete_categories: {},
    route_add_dates: {},
    route_delete_dates: {},
};
