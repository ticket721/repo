/**
 * Generic type to use in all service, to prevent throw fuck fest
 */
export interface ServiceResponse<Response> {
    /**
     * Original data that would have been returned. If set, error should be null
     */
    response: Response;

    /**
     * Instead of throwing, use error keys like 'unauthorized_action' for proper
     * I18N afterwards. If set, response should be null
     */
    error: string;
}
