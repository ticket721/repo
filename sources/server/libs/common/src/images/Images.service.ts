import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import {
    BaseModel,
    InjectModel,
    InjectRepository,
} from '@iaminfinity/express-cassandra';
import { ImagesRepository } from '@lib/common/images/Images.repository';
import { ImageEntity } from '@lib/common/images/entities/Image.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';

/**
 * Service to CRUD ImageEntities
 */
export class ImagesService extends CRUDExtension<
    ImagesRepository,
    ImageEntity
> {
    /**
     * Dependency Injection
     *
     * @param imagesRepository
     * @param imageEntity
     */
    constructor(
        @InjectRepository(ImagesRepository)
        imagesRepository: ImagesRepository,
        @InjectModel(ImageEntity)
        imageEntity: BaseModel<ImageEntity>,
    ) {
        super(imageEntity, imagesRepository);
    }

    /**
     * Increments the link counter
     *
     * @param id
     */
    async link(id: string): Promise<ServiceResponse<ImageEntity>> {
        const res = await this.search({ id });

        if (res.error) {
            return {
                error: 'error_while_fetching',
                response: null,
            };
        }

        if (res.response.length === 0) {
            return {
                error: 'image_not_found',
                response: null,
            };
        }

        const image: ImageEntity = res.response[0];
        const updateRes = await this.update({ id }, { links: image.links + 1 });

        if (updateRes.error) {
            return {
                error: 'image_link_update_error',
                response: null,
            };
        }

        return {
            error: null,
            response: updateRes.response,
        };
    }

    /**
     * Decrements the links counter
     *
     * @param id
     */
    async unlink(id: string): Promise<ServiceResponse<ImageEntity>> {
        const res = await this.search({ id });

        if (res.error) {
            return {
                error: 'error_while_fetching',
                response: null,
            };
        }

        if (res.response.length === 0) {
            return {
                error: 'image_not_found',
                response: null,
            };
        }

        const image: ImageEntity = res.response[0];
        const updateRes = await this.update({ id }, { links: image.links - 1 });

        if (updateRes.error) {
            return {
                error: 'image_unlink_update_error',
                response: null,
            };
        }

        return {
            error: null,
            response: updateRes.response,
        };
    }
}
