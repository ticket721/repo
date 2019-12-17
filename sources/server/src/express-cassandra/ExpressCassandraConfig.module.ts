import { Module }                        from '@nestjs/common';
import { ExpressCassandraConfigService } from './ExpressCassandraConfig.service';
import { ConfigModule }                  from '../config/Config.module';

@Module({
    imports: [ConfigModule],
    providers: [ExpressCassandraConfigService],
    exports: [ExpressCassandraConfigService],
})
export class ExpressCassandraConfigModule {}
