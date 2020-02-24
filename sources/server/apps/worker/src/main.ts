import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { WorkerModule } from '@app/worker/Worker.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@lib/common/config/Config.service';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { setQueues, UI } from 'bull-board';
import {
    InstanceSignature,
    OutrospectionService,
} from '@lib/common/outrospection/Outrospection.service';

/**
 * Core Logger
 */
const logger = new WinstonLoggerService('worker');

/**
 * Main application, starting the T721 Server API
 */
async function main() {
    const app = await NestFactory.create<NestExpressApplication>(WorkerModule, {
        logger,
    });

    const configService: ConfigService = app.get<ConfigService>(ConfigService);

    if (configService.get('BULL_BOARD') === 'true') {
        const mailing = app.get<Queue>(getQueueToken('mailing'));
        const action = app.get<Queue>(getQueueToken('action'));
        setQueues([mailing, action]);
        app.use('/admin/queues', UI);
    }

    app.get(ShutdownService).subscribeToShutdown(() => app.close());

    const instanceSignature: InstanceSignature = await app
        .get(OutrospectionService)
        .getInstanceSignature();

    logger.log(
        `Started instance with signature ${instanceSignature.signature}`,
    );

    await app.listen(configService.get('WORKER_PORT'));
}

main().catch((e: Error) => {
    logger.error(e);
    process.exit(1);
});
