import { Global, Module } from '@nestjs/common';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

/**
 * Module to trigger emergency shutdown from anywhere in the app
 *
 * Very useful when doing critical verifications
 */
@Global()
@Module({
    providers: [
        ShutdownService,
        {
            provide: WinstonLoggerService,
            useValue: new WinstonLoggerService('shutdown'),
        },
    ],
    exports: [ShutdownService],
})
export class ShutdownModule {}
