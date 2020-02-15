import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { GlobalConfigRepository } from '@lib/common/globalconfig/GlobalConfig.repository';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import {
    BaseModel,
    InjectModel,
    InjectRepository,
} from '@iaminfinity/express-cassandra';

export interface GlobalConfigOptions {
    blockNumberFetchingRate: number;
    ethereumPriceFetchingRate: number;
}

/**
 * Service to CRUD GlobalEntities
 */
export class GlobalConfigService extends CRUDExtension<
    GlobalConfigRepository,
    GlobalEntity
> {
    /**
     * Dependency Injection
     *
     * @param globalConfigRepository
     * @param globalEntity
     */
    constructor(
        @InjectRepository(GlobalConfigRepository)
        globalConfigRepository: GlobalConfigRepository,
        @InjectModel(GlobalEntity)
        globalEntity: BaseModel<GlobalEntity>,
    ) {
        super(globalEntity, globalConfigRepository);
    }
}
