import { IsUUID } from 'class-validator';

export class EventsDeployGeneratePayloadParamsDto {
    @IsUUID()
    event: string;
}
