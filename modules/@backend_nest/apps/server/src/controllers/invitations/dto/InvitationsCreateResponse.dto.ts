import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';

/**
 * Data model returned when creating new invitations
 */
export class InvitationsCreateResponseDto {
    /**
     * Invitations created
     */
    invitations: InvitationEntity[];
}
