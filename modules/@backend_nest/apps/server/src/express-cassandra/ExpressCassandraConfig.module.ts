import { Module } from '@nestjs/common';
import { ExpressCassandraConfigService } from './ExpressCassandraConfig.service';

@Module({
    providers: [ExpressCassandraConfigService],
    exports: [ExpressCassandraConfigService],
})
export class ExpressCassandraConfigModule {}
