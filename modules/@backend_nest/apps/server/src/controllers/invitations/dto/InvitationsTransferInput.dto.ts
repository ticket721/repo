import { IsEmail, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when transferring invitation
 */
export class InvitationsTransferInputDto {
    /**
     * App url on which to redirect
     */
    @ApiProperty({
        description: 'App url on which to redirect',
    })
    @IsUrl()
    appUrl: string;

    /**
     * Timezone used for time units
     */
    @ApiProperty({
        description: 'Timezone used for time units',
    })
    @IsString()
    timezone: string;
    /**
     * Invitations owner
     */
    @ApiProperty({
        description: 'new owner of the invitations',
    })
    @IsEmail()
    newOwner: string;
}
