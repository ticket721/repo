import { VenmasRepository } from '@lib/common/venmas/Venmas.repository';
import { VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';

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
}
