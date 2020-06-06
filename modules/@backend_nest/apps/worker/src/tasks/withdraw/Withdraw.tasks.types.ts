/**
 * Data format when withdraw succeeds
 */
export interface WithdrawTransactionConfirmed {
    /**
     * ID of the authorization linked to the withdraw
     */
    authorizationId: string;

    /**
     * Authorization granter
     */
    granter: string;

    /**
     * Authorization grantee
     */
    grantee: string;
}

/**
 * Data format when withdraw fails
 */
export interface WithdrawTransactionFailure {
    /**
     * ID of the authorization linked to the withdraw
     */
    authorizationId: string;

    /**
     * Authorization granter
     */
    granter: string;

    /**
     * Authorization grantee
     */
    grantee: string;
}
