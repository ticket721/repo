import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, Connection, InjectConnection, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { ModuleRef } from '@nestjs/core';
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
     * @param connection
     * @param moduleRef
     */
    constructor(
        @InjectRepository(StripeInterfacesRepository)
        stripeInterfacesRepository: StripeInterfacesRepository,
        @InjectModel(StripeInterfaceEntity)
        stripeInterfaceEntity: BaseModel<StripeInterfaceEntity>,
        @InjectConnection() private readonly connection: Connection,
        private readonly moduleRef: ModuleRef,
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
