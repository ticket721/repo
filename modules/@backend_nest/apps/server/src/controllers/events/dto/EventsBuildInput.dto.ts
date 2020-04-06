import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data input for event building. Requires a completed @event/creation action set
 * The actionset will be destroyed
 */
export class EventsBuildInputDto {
    /**
     * Name of the completed action set
     */
    @ApiProperty({
        description: 'Complete ActionSet ID to consume',
    })
    @ApiProperty()
    @IsString()
    completedActionSet: string;
}
