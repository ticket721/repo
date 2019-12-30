import { UserDto } from './User.dto';

/**
 * Data type returned when searching for users
 */
export class UserSearchDto {
    /**
     * Matching users
     */
    users: UserDto[];

    /**
     * Number of matching users
     */
    hits: number;
}
