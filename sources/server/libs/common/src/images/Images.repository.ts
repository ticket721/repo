import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { ImageEntity } from '@lib/common/images/entities/Image.entity';

/**
 * Repository of the ImageEntity
 */
@EntityRepository(ImageEntity)
export class ImagesRepository extends Repository<ImageEntity> {}
