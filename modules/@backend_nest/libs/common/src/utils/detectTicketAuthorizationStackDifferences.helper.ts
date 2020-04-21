import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';
import _ from 'lodash';

/**
 * Utility to check if steps 1 and 3 of the cart match
 *
 * @param requestedAuthorizations
 * @param existingAuthorizations
 */
export function detectAuthorizationStackDifferences(
    requestedAuthorizations: TicketMintingFormat[],
    existingAuthorizations: AuthorizedTicketMintingFormat[],
): boolean {
    if (requestedAuthorizations.length !== existingAuthorizations.length) {
        return true;
    }

    for (let idx = 0; idx < requestedAuthorizations.length; ++idx) {
        if (
            requestedAuthorizations[idx].categoryId !== existingAuthorizations[idx].categoryId ||
            !_.isEqual(
                _.sortBy(requestedAuthorizations[idx].price || []),
                _.sortBy(existingAuthorizations[idx].price || []),
            )
        ) {
            return true;
        }
    }

    return false;
}
