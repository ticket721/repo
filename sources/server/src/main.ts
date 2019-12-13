import { NestFactory }                    from '@nestjs/core';
import { AppModule }                      from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication }         from '@nestjs/platform-express';
import { WinstonLoggerService }           from './logger/logger.service';
import { ValidationPipe }                 from '@nestjs/common';

/**
 * Main application, starting the T721 API
 */
async function main() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new WinstonLoggerService('core')
    });

    app.useGlobalPipes(new ValidationPipe());

    const options = new DocumentBuilder()
        .setTitle('T721 API')
        .setDescription('')
        .setVersion('1.0.0')
        .addTag('t721')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env['API_PORT'] || 3000);
}
main();
