import { IsObject, IsUUID } from 'class-validator';
import { ApiProperty }      from '@nestjs/swagger';

export class ActionsUpdateInputDto {
    @ApiProperty()
    @IsUUID()
        // tslint:disable-next-line:variable-name
    actionset_id: string;

    @ApiProperty()
    @IsObject()
    data: any;
}
