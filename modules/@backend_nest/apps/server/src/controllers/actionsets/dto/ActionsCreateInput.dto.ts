import { IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when creation an action set
 */
export class ActionsCreateInputDto {
    /**
     * Type Name of the action set
     */
    @ApiProperty({
        description: 'ActionSet type name',
    })
    @IsString()
    name: string;

    /**
     * Initial action set arguments
     */
    @ApiProperty({
        description: 'Initial arguments for the selected ActionSet',
    })
    @IsObject()
    arguments: any;
}
