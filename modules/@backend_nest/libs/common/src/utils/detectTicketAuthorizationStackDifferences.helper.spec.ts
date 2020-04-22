import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { InputPrice } from '@lib/common/currencies/Currencies.service';
import { detectAuthorizationStackDifferences } from '@lib/common/utils/detectTicketAuthorizationStackDifferences.helper';

describe('detectTicketAuthorizationStackDifferences Helper', function() {
    it('should tell stacks are matching', function() {
        const authorizations: TicketMintingFormat[] = [
            {
                categoryId: 'my_category_id',
                price: {
                    currency: 'Fiat',
                    price: '100',
                },
            },
        ];

        const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
            {
                categoryId: 'my_category_id',
                price: {
                    currency: 'Fiat',
                    price: '100',
                },
                authorizationId: 'my_authorization_id',
                groupId: 'my_group_id',
                categoryName: 'category_name',
                granter: 'granter_address',
                grantee: 'grantee_address',
                granterController: 'granter_address_name_in_vault',
                expiration: new Date(Date.now()),
            },
        ];

        const res = detectAuthorizationStackDifferences(authorizations, oldAuthorizations);

        expect(res).toBeFalsy();
    });

    it('should quickly detect on array length', function() {
        const authorizations: TicketMintingFormat[] = [
            {
                categoryId: 'my_category_id',
                price: {
                    currency: 'Fiat',
                    price: '100',
                },
            },
            {
                categoryId: 'my_category_id',
                price: {
                    currency: 'Fiat',
                    price: '100',
                },
            },
        ];

        const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
            {
                categoryId: 'my_category_id',
                price: {
                    currency: 'Fiat',
                    price: '100',
                },
                authorizationId: 'my_authorization_id',
                groupId: 'my_group_id',
                categoryName: 'category_name',
                granter: 'granter_address',
                grantee: 'grantee_address',
                granterController: 'granter_address_name_in_vault',
                expiration: new Date(Date.now()),
            },
        ];

        const res = detectAuthorizationStackDifferences(authorizations, oldAuthorizations);

        expect(res).toBeTruthy();
    });

    it('should detect internal differences on category ids', function() {
        const authorizations: TicketMintingFormat[] = [
            {
                categoryId: 'my_category_id',
                price: {
                    currency: 'Fiat',
                    price: '100',
                },
            },
        ];

        const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
            {
                categoryId: 'my_wrong_category_id',
                price: {
                    currency: 'Fiat',
                    price: '100',
                },
                authorizationId: 'my_authorization_id',
                groupId: 'my_group_id',
                categoryName: 'category_name',
                granter: 'granter_address',
                grantee: 'grantee_address',
                granterController: 'granter_address_name_in_vault',
                expiration: new Date(Date.now()),
            },
        ];

        const res = detectAuthorizationStackDifferences(authorizations, oldAuthorizations);

        expect(res).toBeTruthy();
    });

    it('should detect internal differences on price', function() {
        const authorizations: TicketMintingFormat[] = [
            {
                categoryId: 'my_category_id',
                price: {
                    currency: 'Fiat',
                    price: '100',
                },
            },
        ];

        const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
            {
                categoryId: 'my_wrong_category_id',
                price: {
                    currency: 'Fiat',
                    price: '101',
                },
                authorizationId: 'my_authorization_id',
                groupId: 'my_group_id',
                categoryName: 'category_name',
                granter: 'granter_address',
                grantee: 'grantee_address',
                granterController: 'granter_address_name_in_vault',
                expiration: new Date(Date.now()),
            },
        ];

        const res = detectAuthorizationStackDifferences(authorizations, oldAuthorizations);

        expect(res).toBeTruthy();
    });
});
