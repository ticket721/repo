import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';

/**
 * Data Model returned by the invitation search query
 */
export class InvitationsOwnedSearchResponseDto {
    /**
     * Invitations matching the query
     */
    invitations: InvitationEntity[];
}
