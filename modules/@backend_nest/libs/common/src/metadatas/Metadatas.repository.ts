import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { MetadataEntity } from '@lib/common/metadatas/entities/Metadata.entity';

/**
 * Repository for the Metadata Entities
 */
@EntityRepository(MetadataEntity)
export class MetadatasRepository extends Repository<MetadataEntity> {}
