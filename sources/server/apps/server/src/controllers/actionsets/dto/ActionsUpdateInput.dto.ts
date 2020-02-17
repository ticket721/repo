import { IsNumber, IsObject, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required to update an Action
 */
export class ActionsUpdateInputDto {
    /**
     * ActionSet to update
     */
    @ApiProperty()
    @IsUUID()
    // tslint:disable-next-line:variable-name
    actionset_id: string;

    /**
     * Data to insert into action before setting waiting status
     */
    @ApiProperty()
    @IsObject()
    data: any;

    /**
     * If defined, edits another action than current one. Can throw on invalid index
     */
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    action_idx?: number;
}
