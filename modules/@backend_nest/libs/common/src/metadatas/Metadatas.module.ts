import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { MetadataEntity } from '@lib/common/metadatas/entities/Metadata.entity';
import { MetadatasRepository } from '@lib/common/metadatas/Metadatas.repository';
import { MetadatasService } from '@lib/common/metadatas/Metadatas.service';
import { RightsModule } from '@lib/common/rights/Rights.module';

@Module({
    imports: [ExpressCassandraModule.forFeature([MetadataEntity, MetadatasRepository]), RightsModule],
    providers: [MetadatasService],
    exports: [MetadatasService],
})
export class MetadatasModule {}
