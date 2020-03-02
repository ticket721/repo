import { Injectable } from '@nestjs/common';
import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { StripeResourcesRepository } from '@lib/common/striperesources/StripeResources.repository';
import { StripeResourceEntity } from '@lib/common/striperesources/entities/StripeResource.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';

/**
 * Service to CRUD the Strip Resources
 */
@Injectable()
export class StripeResourcesService extends CRUDExtension<StripeResourcesRepository, StripeResourceEntity> {
    /**
     * Dependency Injection
     *
     * @param stripeResourcesRepository
     * @param stripeResourceEntity
     */
    constructor(
        @InjectRepository(StripeResourcesRepository)
        stripeResourcesRepository: StripeResourcesRepository,
        @InjectModel(StripeResourceEntity)
        stripeResourceEntity: BaseModel<StripeResourceEntity>,
    ) {
        super(
            stripeResourceEntity,
            stripeResourcesRepository,
            /* istanbul ignore next */
            (e: StripeResourceEntity) => {
                return new stripeResourceEntity(e);
            },
        );
    }
}
