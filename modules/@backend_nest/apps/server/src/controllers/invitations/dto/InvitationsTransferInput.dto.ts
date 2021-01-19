import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when transferring invitation
 */
export class InvitationsTransferInputDto {
    /**
     * Invitations owner
     */
    @ApiProperty({
        description: 'new owner of the invitations',
    })
    @IsEmail()
    newOwner: string;
}
