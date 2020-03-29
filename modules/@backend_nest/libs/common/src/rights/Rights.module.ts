import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { RightsRepository } from '@lib/common/rights/Rights.repository';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';
import { RightsService } from '@lib/common/rights/Rights.service';

@Module({
    imports: [ExpressCassandraModule.forFeature([RightEntity, RightsRepository])],
    providers: [RightsService],
    exports: [RightsService],
})
export class RightsModule {}
