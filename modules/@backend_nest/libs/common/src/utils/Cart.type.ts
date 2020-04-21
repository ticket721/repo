import { InputPrice } from '@lib/common/currencies/Currencies.service';

export class TicketMintingFormat {
    categoryId: string;
    price?: InputPrice;
}

export class AuthorizedTicketMintingFormat extends TicketMintingFormat {
    authorizationId: string;
    groupId: string;

    categoryName: string;

    granter: string;
    grantee: string;
    granterController: string;

    expiration: Date;
}
