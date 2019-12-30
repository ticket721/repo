import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ServerModule } from './Server.module';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

/**
 * Main application, starting the T721 Server API
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
        // const web3token_clear = app.get<Queue>(getQueueToken('web3token/clear'));
        // setQueues([web3token_clear]);
        // app.use('/admin/queues', UI);
    }

    app.get(ShutdownService).subscribeToShutdown(() => app.close());

    await app.listen(configService.get('API_PORT'));
}

main();
