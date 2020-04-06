import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights config for the actionset scope
 */
export const ActionSetsRightsConfig: RightsConfig = {
    owner: {
        count: 1,
        can_edit_rights: true,
    },
    route_search: {
        public: true,
    },
};
