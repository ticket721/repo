import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the Dates count
 */
export class ActionsCountResponseDto {
    /**
     * Actions matching the query
     */
    actionsets: ESCountReturn;
}
