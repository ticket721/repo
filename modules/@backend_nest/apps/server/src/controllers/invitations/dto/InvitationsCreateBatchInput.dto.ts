import { IsEmail, IsNumber, IsString, IsUrl, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Format of an invitation
 */
export class InvitationFormat {
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

/**
 * Data model required when creating new invitations
 */
export class InvitationsCreateBatchInputDto {
    /**
     * Invitations data
     */
    @ApiProperty({
        description: 'Batched invitation creation',
    })
    @ValidateNested({ each: true })
    @Type(() => InvitationFormat)
    invitations: InvitationFormat[];

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
}
