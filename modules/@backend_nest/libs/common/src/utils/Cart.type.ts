import { InputPrice } from '@lib/common/currencies/Currencies.service';

/**
 * Input format for the ticket minting
 */
export class TicketMintingFormat {
    /**
     * Desired category id
     */
    categoryId: string;

    /**
     * Price to use
     */
    price?: InputPrice;
}

/**
 * Final authorization format
 */
export class AuthorizedTicketMintingFormat extends TicketMintingFormat {
    /**
     * Id of the authorization entity
     */
    authorizationId: string;

    /**
     * Group ID
     */
    groupId: string;

    /**
     * Name of the ticket category
     */
    categoryName: string;

    /**
     * Granter address
     */
    granter: string;

    /**
     * Grantee address
     */
    grantee: string;

    /**
     * Name of the granter controller
     */
    granterController: string;

    /**
     * Expiration date of the authorization
     */
    expiration: Date;
}
