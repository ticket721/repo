import { CRUDExtension, CRUDResponse } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { DatesRepository } from '@lib/common/dates/Dates.repository';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Service to CRUD DateEntities
 */
export class DatesService extends CRUDExtension<DatesRepository, DateEntity> {
    /**
     * Dependency injection
     *
     * @param datesRepository
     * @param dateEntity
     */
    constructor(
        @InjectRepository(DatesRepository)
        datesRepository: DatesRepository,
        @InjectModel(DateEntity)
        dateEntity: BaseModel<DateEntity>,
    ) {
        super(
            dateEntity,
            datesRepository,
            /* istanbul ignore next */
            (e: DateEntity) => {
                return new dateEntity(e);
            },
            /* istanbul ignore next */
            (d: DateEntity) => {
                return new DateEntity(d);
            },
        );
    }

    public async createEventDate(
        date: Omit<DateEntity, 'id' | 'event' | 'created_at' | 'updated_at'>,
        eventId: string,
    ): Promise<CRUDResponse<DateEntity>> {
        return this.create({
            ...date,
            event: eventId,
        });
    }
}
