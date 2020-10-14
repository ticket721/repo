import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { Injectable } from '@nestjs/common';
import { PurchasesRepository } from '@lib/common/purchases/Purchases.repository';
import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';

@Injectable()
export class PurchasesService extends CRUDExtension<PurchasesRepository, PurchaseEntity> {
    /**
     * Dependency Injection
     *
     * @param purchasesRepository
     * @param purchaseEntity
     */
    constructor(
        @InjectRepository(PurchasesRepository)
        purchasesRepository: PurchasesRepository,
        @InjectModel(PurchaseEntity)
        purchaseEntity: BaseModel<PurchaseEntity>,
    ) {
        super(
            purchaseEntity,
            purchasesRepository,
            /* istanbul ignore next */
            (te: PurchaseEntity) => {
                return new purchaseEntity(te);
            },
            /* istanbul ignore next */
            (te: PurchaseEntity) => {
                return new PurchaseEntity(te);
            },
        );
    }

    // add to cart
    // remove from cart
    // checkout cart
    // get status
    // on status becoming complete
    // on status becoming error
}
