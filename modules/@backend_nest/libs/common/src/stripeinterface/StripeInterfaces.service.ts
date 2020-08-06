import { CRUDExtension }                            from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { StripeInterfacesRepository }               from '@lib/common/stripeinterface/StripeInterfaces.repository';
import { StripeInterfaceEntity }                    from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { ServiceResponse }                          from '@lib/common/utils/ServiceResponse.type';
import { StripeService }                            from '@lib/common/stripe/Stripe.service';
import { UserDto }                                  from '@lib/common/users/dto/User.dto';
import { fromES }                                   from '@lib/common/utils/fromES.helper';

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
        private readonly stripeService: StripeService,
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

    async recoverUserInterface(user: UserDto): Promise<ServiceResponse<StripeInterfaceEntity>> {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                owner: user.id
                            }
                        }
                    }
                }
            }
        };

        const esQueryResult = await this.searchElastic(esQuery);

        if (esQueryResult.error) {
            return {
                error: esQueryResult.error,
                response: null
            }
        }

        if (esQueryResult.response.hits.total === 0) {
            const newStripeInterface = await this.create({
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            });

            if (newStripeInterface.error) {
                return {
                    error: newStripeInterface.error,
                    response: null
                }
            }

            return {
                error: null,
                response: newStripeInterface.response
            }
        } else {
            return {
                error: null,
                response: fromES<StripeInterfaceEntity>(esQueryResult.response.hits.hits[0])
            }
        }
    }

    // async createAccountToken(businessType: string): Promise<ServiceResponse<string>> {
    //     const newAccountToken = await this.stripeService.get().tokens.create({
    //         account: {
    //             tos_shown_and_accepted: true,
    //             businessType,
    //         }
    //     })
    // }
}
