import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

/**
 * Service used to trigger applicatiom shutdown
 */
@Injectable()
export class ShutdownService {
    /**
     * Observable used to trigger shutdown
     */
    private static shutdownFunction: () => void;

    /**
     * Dependency Injection
     *
     * @param winstonLoggerService
     */
    constructor(private readonly winstonLoggerService: WinstonLoggerService) {}

    /**
     * Add method to call on shutdown.
     *
     * @param shutdownFn
     */
    subscribeToShutdown(shutdownFn: () => void): void {
        ShutdownService.shutdownFunction = shutdownFn;
    }

    /**
     * Logs provided message before triggering shutdown
     *
     * @param msg
     */
    shutdownWithMessage(msg: string) {
        /* istanbul ignore next */
        if (this === undefined) {
            console.error(msg);
            console.error(
                'ShutdownService: Emergency exit, ShutdownModule was not able to initialize and triggered a manual process exit',
            );
            process.exit(1);
        }

        this.winstonLoggerService.log(msg);
        this.shutdown();
    }

    /**
     * Logs provided error before triggering shutdown
     *
     * @param error
     */
    shutdownWithError(error: Error) {
        /* istanbul ignore next */
        if (this === undefined) {
            console.error(error.message);
            console.error(error.stack);
            console.error(
                'ShutdownService: Emergency exit, ShutdownModule was not able to initialize and triggered a manual process exit',
            );
            process.exit(1);
        }

        this.winstonLoggerService.error(error);
        this.shutdown();
    }

    /**
     * Simply trigegrs the shutdown
     */
    shutdown() {
        /* istanbul ignore next */
        if (this === undefined) {
            console.error(
                'ShutdownService: Emergency exit, ShutdownModule was not able to initialize and triggered a manual process exit',
            );
            process.exit(1);
        }

        ShutdownService.shutdownFunction();
    }
}
