import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when updating the device address
 */
export class UsersSetDeviceAddressInputDto {
    /**
     * New device address
     */
    @ApiProperty()
    @IsString()
    deviceAddress: string;
}
