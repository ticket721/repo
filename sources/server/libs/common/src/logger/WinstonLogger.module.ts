import { Module }               from '@nestjs/common';
import { WinstonLoggerService } from './WinstonLogger.service';

@Module({
    providers: [WinstonLoggerService],
    exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {
}
