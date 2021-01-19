import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';

/**
 * Data model returned when transferring invitation
 */
export class InvitationsTransferResponseDto {
    /**
     * Invitations owner
     */
    invitation: InvitationEntity;
}
