import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { Injectable } from '@nestjs/common';
import { PurchasesRepository } from '@lib/common/purchases/Purchases.repository';
import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

export interface PurchaseError {
    reason: string;
    context: any;
}

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
        // private readonly moduleRef: ModuleRef,
        // private readonly usersService: UsersService,
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

    async findOne(purchaseId: string): Promise<ServiceResponse<PurchaseEntity>> {
        // Recover Purchase
        const purchaseRes = await this.search({
            id: purchaseId,
        });

        console.log(purchaseRes);

        if (purchaseRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (purchaseRes.response.length === 0) {
            return {
                error: 'not_found',
                response: null,
            };
        }

        return {
            response: purchaseRes.response[0],
            error: null,
        };
    }

    async checkCartStatus(user: UserDto, purchase: PurchaseEntity): Promise<ServiceResponse<PurchaseError[]>> {
        return {
            error: null,
            response: [],
        };
    }

    // // add to cart
    // async addProductToCart(user: UserDto, product: Product): Promise<ServiceResponse<PurchaseEntity>> {
    //     const productHandler: ProductCheckerBaseServiceBase = this.moduleRef.get(`product/${product.type}`, {
    //         strict: false,
    //     });
    //
    //     const userCartIdRes: ServiceResponse<string> = await this.usersService.recoverUserCart(user.id);
    //
    //     if (userCartIdRes.error || !userCartIdRes.response) {
    //         return {
    //             error: 'unable_to_recover_cart',
    //             response: null,
    //         };
    //     }
    //
    //     const purchaseEntityRes: CRUDResponse<PurchaseEntity[]> = await this.search({
    //         id: userCartIdRes.response,
    //     });
    //
    //     if (purchaseEntityRes.error || purchaseEntityRes.response.length === 0) {
    //         return {
    //             error: 'cart_not_found',
    //             response: null,
    //         };
    //     }
    //
    //     const purchaseEntity: PurchaseEntity = purchaseEntityRes.response[0];
    //
    //     // const updatedPurchaseEntity: ServiceResponse<PurchaseEntity> = await productHandler.addToCartHandle(
    //     //     user,
    //     //     purchaseEntity,
    //     //     product
    //     // );
    //
    //     // console.log(updatedPurchaseEntity);
    // }

    // remove from cart
    // checkout cart
    // get status
    // on status becoming complete
    // on status becoming error
}
