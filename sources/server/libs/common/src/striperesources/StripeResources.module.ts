import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { StripeResourcesService } from '@lib/common/striperesources/StripeResources.service';
import { StripeResourceEntity } from '@lib/common/striperesources/entities/StripeResource.entity';
import { StripeResourcesRepository } from '@lib/common/striperesources/StripeResources.repository';

@Module({
    imports: [ExpressCassandraModule.forFeature([StripeResourceEntity, StripeResourcesRepository])],
    providers: [StripeResourcesService],
    exports: [StripeResourcesService],
})
export class StripeResourcesModule {}
