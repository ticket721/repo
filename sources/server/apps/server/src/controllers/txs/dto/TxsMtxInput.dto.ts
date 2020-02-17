import { EIP712Payload } from '@ticket721/e712';
import { IsObject, IsString } from 'class-validator';

/**
 * Data Model when broadcasting a meta transaction
 */
export class TxsMtxInputDto {
    /**
     * Payload to broadcast
     */
    @IsObject()
    payload: EIP712Payload;

    /**
     * Signature of the payload
     */
    @IsString()
    signature: string;
}
