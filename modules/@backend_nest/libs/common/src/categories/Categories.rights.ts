import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights Config for the category scope
 */
export const CategoriesRightsConfig: RightsConfig = {
    owner: {
        count: 1,
        can_edit_rights: true,
    },
    admin: {},
    route_update: {},
    route_create: {},
    route_search: {
        public: true,
    },
};
