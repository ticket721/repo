import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { GemOrdersRepository } from '@lib/common/gemorders/GemOrders.repository';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { GemOrdersRightsConfig } from '@lib/common/gemorders/GemOrders.rights';
import { RightsModule } from '@lib/common/rights/Rights.module';

@Module({
    imports: [ExpressCassandraModule.forFeature([GemOrderEntity, GemOrdersRepository]), RightsModule],
    providers: [
        GemOrdersService,
        {
            provide: `@rights/gemorder`,
            useValue: GemOrdersRightsConfig,
        },
    ],
    exports: [GemOrdersService],
})
export class GemOrdersModule {}
