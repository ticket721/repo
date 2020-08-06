import { CRUDExtension }                            from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { StripeInterfacesRepository }               from '@lib/common/stripeinterface/StripeInterfaces.repository';
import { StripeInterfaceEntity }                    from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { ServiceResponse }                          from '@lib/common/utils/ServiceResponse.type';
import { StripeService }                            from '@lib/common/stripe/Stripe.service';

/**
 * Service to CRUD StripeInterfaceEntities
 */
export class StripeInterfacesService extends CRUDExtension<StripeInterfacesRepository, StripeInterfaceEntity> {
    /**
     * Dependency injection
     *
     * @param stripeInterfacesRepository
     * @param stripeInterfaceEntity
     * @param stripeService
     */
    constructor(
        @InjectRepository(StripeInterfacesRepository)
        stripeInterfacesRepository: StripeInterfacesRepository,
        @InjectModel(StripeInterfaceEntity)
        stripeInterfaceEntity: BaseModel<StripeInterfaceEntity>,
        private readonly stripeService: StripeService
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

    async createAccountToken(businessType: string): Promise<ServiceResponse<string>> {
        const newAccountToken = await this.stripeService.get().tokens.create({
            account: {
                tos_shown_and_accepted: true,
                businessType,
            }
        })
    }
}
