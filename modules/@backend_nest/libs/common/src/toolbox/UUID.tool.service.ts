import { uuid, isUuid } from '@iaminfinity/express-cassandra';

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

    /**
     *
     * @param uuidValue
     */
    verify(uuidValue: string): boolean {
        try {
            const parsedUuid = uuid(uuidValue);

            return isUuid(parsedUuid);
        } catch (e) {
            return false;
        }
    }
}
