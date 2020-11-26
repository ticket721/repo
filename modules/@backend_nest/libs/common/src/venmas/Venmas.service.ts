import { VenmasRepository }                         from '@lib/common/venmas/Venmas.repository';
import { VenmasEntity }                             from '@lib/common/venmas/entities/Venmas.entity';
import { CategoriesService }                        from '@lib/common/categories/Categories.service';
import { CRUDExtension }                            from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { ServiceResponse }                          from '@lib/common/utils/ServiceResponse.type';
import { CategoryEntity }                           from '@lib/common/categories/entities/Category.entity';

/**
 * Service to CRUD VenmasEntities
 */
export class VenmasService extends CRUDExtension<VenmasRepository, VenmasEntity> {
    /**
     * Dependency injection
     *
     * @param venmasRepository
     * @param venmasEntity
     * @param categoriesService
     */
    constructor(
        @InjectRepository(VenmasRepository)
        venmasRepository: VenmasRepository,
        @InjectModel(VenmasEntity)
        venmasEntity: BaseModel<VenmasEntity>,
        private readonly categoriesService: CategoriesService,
    ) {
        super(
            venmasEntity,
            venmasRepository,
            /* istanbul ignore next */
            (e: VenmasEntity) => {
                return new venmasEntity(e);
            },
            /* istanbul ignore next */
            (e: VenmasEntity) => {
                return new VenmasEntity(e);
            },
        );
    }

    /**
     * Find a venmas entity by id
     *
     * @param venmasId
     */
    async findOne(venmasId: string): Promise<ServiceResponse<VenmasEntity>> {
        // Recover Event
        const venmasRes = await this.search({
            id: venmasId,
        });

        if (venmasRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (venmasRes.response.length === 0) {
            return {
                error: 'venmas_entity_not_found',
                response: null,
            };
        }

        return {
            response: venmasRes.response[0],
            error: null,
        };
    }
}
