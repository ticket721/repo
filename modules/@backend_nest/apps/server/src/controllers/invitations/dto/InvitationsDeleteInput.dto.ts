import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when deleting invitations
 */
export class InvitationsDeleteInputDto {
    /**
     * Invitation IDs to delete
     */
    @ApiProperty({
        description: 'Amount to create',
    })
    @IsUUID('4', { each: true })
    invitations: string[];
}
