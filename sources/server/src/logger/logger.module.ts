import { Module }               from '@nestjs/common';
import { WinstonLoggerService } from './logger.service';

@Module({
    providers: [WinstonLoggerService],
    exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {}
