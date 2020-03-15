import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { GemOrdersRepository } from '@lib/common/gemorders/GemOrders.repository';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';

@Module({
    imports: [ExpressCassandraModule.forFeature([GemOrderEntity, GemOrdersRepository])],
    providers: [GemOrdersService],
    exports: [GemOrdersService],
})
export class GemOrdersModule {}
