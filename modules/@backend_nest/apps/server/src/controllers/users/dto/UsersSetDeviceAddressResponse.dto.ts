import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * Data model returned when updating the device address
 */
export class UsersSetDeviceAddressResponseDto {
    /**
     * Updated user
     */
    user: UserDto;
}
