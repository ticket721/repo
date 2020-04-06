import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { GemOrdersRepository } from '@lib/common/gemorders/GemOrders.repository';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { types } from 'cassandra-driver';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn.type';
import { RightsService } from '@lib/common/rights/Rights.service';
import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * Service to CRUD Gem Orders
 */
export class GemOrdersService extends CRUDExtension<GemOrdersRepository, GemOrderEntity> {
    /**
     * Dependency Injection
     *
     * @param gemOrdersRepository
     * @param gemOrderEntity
     * @param rightsService
     */
    constructor(
        @InjectRepository(GemOrdersRepository)
        gemOrdersRepository: GemOrdersRepository,
        @InjectModel(GemOrderEntity)
        gemOrderEntity: BaseModel<GemOrderEntity>,
        private readonly rightsService: RightsService,
    ) {
        super(
            gemOrderEntity,
            gemOrdersRepository,
            /* istanbul ignore next */
            (e: GemOrderEntity) => {
                return new gemOrderEntity(e);
            },
            /* istanbul ignore next */
            (go: GemOrderEntity) => {
                return new GemOrderEntity(go);
            },
        );
    }

    /**
     * Utility to create a new gem order with a random distribution ID
     *
     * @param circuit
     * @param user
     * @param args
     * @param collision
     */
    async startGemOrder(
        circuit: string,
        user: string,
        args: any,
        collision: string,
    ): Promise<ServiceResponse<GemOrderEntity>> {
        let id = null;
        let res: ESSearchReturn<GemOrderEntity> = null;
        do {
            id = GemOrderEntity.genOrderID();

            const queryRes = await this.searchElastic({
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    collision_id: id,
                                },
                            },
                        },
                    },
                },
            });

            if (queryRes.error) {
                return {
                    error: queryRes.error,
                    response: null,
                };
            }

            res = queryRes.response;
        } while (res.hits.total !== 0);

        const createdOrderRes = await this.create(
            {
                id: collision,
                distribution_id: (types.Long as any).fromNumber(id),
                circuit_name: circuit,
                initial_arguments: JSON.stringify(args),
                initialized: false,
                refresh_timer: 1,
            },
            {
                if_not_exist: true,
            },
        );

        await this.rightsService.addRights(
            {
                id: user,
            } as UserDto,
            [
                {
                    entityValue: collision,
                    entity: 'gemorder',
                    rights: {
                        owner: true,
                    },
                },
            ],
        );

        if (createdOrderRes.error) {
            return {
                error: createdOrderRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: createdOrderRes.response,
        };
    }
}
