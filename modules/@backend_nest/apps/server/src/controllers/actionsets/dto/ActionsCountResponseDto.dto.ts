import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the actions count
 */
export class ActionsCountResponseDto {
    /**
     * Actions matching the query
     */
    actionsets: ESCountReturn;
}
