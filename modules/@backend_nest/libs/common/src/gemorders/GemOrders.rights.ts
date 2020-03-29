import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights Config of the gemorder scope
 */
export const GemOrdersRightsConfig: RightsConfig = {
    owner: {
        count: 1,
        can_edit_rights: true,
    },
    admin: {},
};
