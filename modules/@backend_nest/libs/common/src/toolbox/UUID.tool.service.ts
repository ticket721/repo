import { uuid } from '@iaminfinity/express-cassandra';

/**
 * UUID Tool to work with everything UUID related
 */
export class UUIDToolService {
    /**
     * Generate a random UUID4 string
     */
    generate(): string {
        return uuid().toString();
    }
}
