import * as Crypto from 'crypto';

/**
 * Bytes Tool to work with bytes and hexadecimal data
 */
export class BytesToolService {
    /**
     * Generate a random
     *
     * @param len
     */
    randomBytes(len: number): string {
        return Crypto.randomBytes(len)
            .toString('hex')
            .toLowerCase();
    }
}
