import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Data model returned when creating a date
 */
export class DatesCreateResponseDto {
    /**
     * Created date
     */
    date: DateEntity;
}
