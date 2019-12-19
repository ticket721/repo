import { Module }                        from '@nestjs/common';
import { ExpressCassandraConfigService } from './ExpressCassandraConfig.service';
import { ConfigModule }                  from '@lib/common/config/Config.module';
import { Config }                        from '../utils/Config.joi';

@Module({
    imports: [ConfigModule.forRoot(Config)],
    providers: [ExpressCassandraConfigService],
    exports: [ExpressCassandraConfigService],
})
export class ExpressCassandraConfigModule {}
