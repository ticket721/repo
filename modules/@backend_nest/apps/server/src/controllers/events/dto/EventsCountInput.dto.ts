import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { EventsSearchInputDto } from '@app/server/controllers/events/dto/EventsSearchInput.dto';

/**
 * Data model for the event search query
 */
export class EventsCountInputDto extends EventsSearchInputDto {}
