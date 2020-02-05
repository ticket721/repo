import { EIP712Payload } from '@ticket721/e712';
import { IsObject, IsString } from 'class-validator';

export class TxsMtxInputDto {
    @IsObject()
    payload: EIP712Payload;

    @IsString()
    signature: string;
}
