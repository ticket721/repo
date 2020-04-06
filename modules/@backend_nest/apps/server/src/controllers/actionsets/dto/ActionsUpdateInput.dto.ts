import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model required to update an Action
 */
export class ActionsUpdateInputDto {
    /**
     * Data to insert into action before setting waiting status
     */
    @ApiProperty({
        description: 'Date to insert at current or provided index',
    })
    @IsObject()
    data: any;

    /**
     * If defined, edits another action than current one. Can throw on invalid index
     */
    @ApiPropertyOptional({
        description: 'Action index to edit. If not provided, current will be modified',
    })
    @IsNumber()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    action_idx?: number;
}
