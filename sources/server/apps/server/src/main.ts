import { NestFactory }                    from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication }         from '@nestjs/platform-express';
import { ValidationPipe }                 from '@nestjs/common';
import { ServerModule }                   from './Server.module';
import { WinstonLoggerService }           from '@lib/common/logger/WinstonLogger.service';
import { ConfigService }                  from '@lib/common/config/Config.service';
import { getQueueToken }                  from '@nestjs/bull';
import { Queue }                          from 'bull';
import { UI, setQueues }                  from 'bull-board';

/**
 * Main application, starting the T721 API
 */
async function main() {
    const app = await NestFactory.create<NestExpressApplication>(ServerModule, {
        logger: new WinstonLoggerService('core'),
    });

    const configService: ConfigService = app.get<ConfigService>(ConfigService);

    app.useGlobalPipes(new ValidationPipe());

    const options = new DocumentBuilder()
        .setTitle('T721 API')
        .setDescription('')
        .setVersion('1.0.0')
        .addTag('t721')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    if (configService.get('BULL_BOARD') === 'true') {

        const queue = app.get<Queue>(getQueueToken('queue'));
        setQueues(queue);
        app.use('/admin/queues', UI);

    }

    await app.listen(configService.get('API_PORT'));
}

main();
