import { Module }                        from '@nestjs/common';
import { ExpressCassandraConfigService } from './express-cassandra-config.service';
import { ConfigModule }                  from '../config/config.module';

@Module({
    imports: [ConfigModule],
    providers: [ExpressCassandraConfigService],
    exports: [ExpressCassandraConfigService],
})
export class ExpressCassandraConfigModule {}
