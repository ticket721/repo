import { EventGenericInfosPayload } from '@common/global/lib/event';
import { EventEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';

export const formatEventEntity = (event: EventEntity): EventGenericInfosPayload => ({
    name: event.name,
    description: event.description,
    avatar: event.avatar,
    signatureColors: event.signature_colors,
});
