import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required to update the consumed flag of an Action
 */
export class ActionsConsumeUpdateInputDto {
    /**
     * Consumed flag new value
     */
    @ApiProperty({
        description: 'Consumed flag new value',
    })
    @IsBoolean()
    consumed: boolean;
}
