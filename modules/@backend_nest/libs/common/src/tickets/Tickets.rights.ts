import { RightsConfig } from '@lib/common/rights/RightsConfig.type';

/**
 * Rights Config for the ticket scope
 */
export const TicketsRightsConfig: RightsConfig = {
    owner: {
        can_edit_rights: true,
        countAs: ['admin'],
    },
    admin: {
        countAs: ['metadata_all'],
    },

    metadata_all: {},

    metadata_read_all: {},
    metadata_write_all: {},

    metadata_write_history: {},
    metadata_read_history: {},
};
