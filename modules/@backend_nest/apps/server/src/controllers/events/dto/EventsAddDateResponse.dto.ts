import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { ErrorNode } from '@common/global';

export class EventsAddDateResponseDto {
    error?: ErrorNode;
    date?: DateEntity;
}
