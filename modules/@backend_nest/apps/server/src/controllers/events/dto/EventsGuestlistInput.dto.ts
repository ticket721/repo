import { IsNumber, IsString } from 'class-validator';
import { ApiProperty }        from '@nestjs/swagger';

export class EventsGuestlistInputDto {
    @ApiProperty()
    @IsString({each: true})
    dateIds: string[];

    @ApiProperty()
    @IsNumber()
        // tslint:disable-next-line:variable-name
    page_size: number;

    @ApiProperty()
    @IsNumber()
        // tslint:disable-next-line:variable-name
    page_index: number;
}
