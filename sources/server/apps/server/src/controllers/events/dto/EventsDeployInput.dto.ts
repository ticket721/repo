import { IsObject, IsString, IsUUID } from 'class-validator';
import { EIP712Payload } from '@ticket721/e712';

export class EventsDeployInputDto {
    @IsObject()
    payload: EIP712Payload;

    @IsString()
    signature: string;

    @IsUUID()
    event: string;
}
