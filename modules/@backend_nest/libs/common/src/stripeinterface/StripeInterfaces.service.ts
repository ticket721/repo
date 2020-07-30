import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { StripeInterfacesRepository } from '@lib/common/stripeinterface/StripeInterfaces.repository';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Service to CRUD StripeInterfaceEntities
 */
export class StripeInterfacesService extends CRUDExtension<StripeInterfacesRepository, StripeInterfaceEntity> {
    /**
     * Dependency injection
     *
     * @param stripeInterfacesRepository
     * @param stripeInterfaceEntity
     */
    constructor(
        @InjectRepository(StripeInterfacesRepository)
        stripeInterfacesRepository: StripeInterfacesRepository,
        @InjectModel(StripeInterfaceEntity)
        stripeInterfaceEntity: BaseModel<StripeInterfaceEntity>,
    ) {
        super(
            stripeInterfaceEntity,
            stripeInterfacesRepository,
            /* istanbul ignore next */
            (e: StripeInterfaceEntity) => {
                return new stripeInterfaceEntity(e);
            },
            /* istanbul ignore next */
            (r: StripeInterfaceEntity) => {
                return new StripeInterfaceEntity(r);
            },
        );
    }
}
