import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ServerModule } from './Server.module';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { setQueues, UI } from 'bull-board';
import * as express from 'express';

/**
 * Main application, starting the T721 Server API
 */
async function main() {
    const app = await NestFactory.create<NestExpressApplication>(ServerModule, {
        logger: new WinstonLoggerService('core'),
    });

    const configService: ConfigService = app.get<ConfigService>(ConfigService);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            forbidUnknownValues: true,
        }),
    );

    app.use(
        '/static',
        express.static(configService.get('IMAGE_SERVE_DIRECTORY'), {
            extensions: ['png', 'jpg', 'gif', 'svg', 'bmp'],
        }),
    );

    const options = new DocumentBuilder()
        .setTitle('T721 API')
        .setDescription('')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    if (configService.get('BULL_BOARD') === 'true') {
        const mailing = app.get<Queue>(getQueueToken('mailing'));
        const action = app.get<Queue>(getQueueToken('action'));
        setQueues([mailing, action]);
        app.use('/admin/queues', UI);
    }

    app.get(ShutdownService).subscribeToShutdown(() => app.close());

    await app.listen(configService.get('API_PORT'));
}

main();
