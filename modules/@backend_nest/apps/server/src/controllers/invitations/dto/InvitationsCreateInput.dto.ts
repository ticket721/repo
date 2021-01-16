import { IsEmail, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when creating new invitations
 */
export class InvitationsCreateInputDto {
    /**
     * New date details
     */
    @ApiProperty({
        description: 'Dates accessible by the invitation',
    })
    @IsUUID('4', { each: true })
    dates: string[];

    /**
     * Invitations owner
     */
    @ApiProperty({
        description: 'Owner of the invitations',
    })
    @IsEmail()
    owner: string;

    /**
     * Amount of invitations to create
     */
    @ApiProperty({
        description: 'Amount to create',
    })
    @IsNumber()
    amount: number;
}
