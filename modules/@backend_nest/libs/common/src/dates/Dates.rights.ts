import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights Config for the date scope
 */
export const DatesRightsConfig: RightsConfig = {
    owner: {
        count: 1,
        can_edit_rights: true,
    },
    admin: {},
    route_create: {},
    route_search: {
        public: true,
    },
    route_add_categories: {},
    route_delete_categories: {},
    route_update: {},
};
