import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';

/**
 * Data model returned when creating new invitations
 */
export class InvitationsCreateBatchResponseDto {
    /**
     * Invitations created
     */
    invitations: InvitationEntity[];
}
