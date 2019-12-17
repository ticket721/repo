import { NestFactory }                    from '@nestjs/core';
import { AppModule }                      from './App.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication }         from '@nestjs/platform-express';
import { WinstonLoggerService }           from './logger/WinstonLogger.service';
import { ValidationPipe }                 from '@nestjs/common';
import { ConfigService }                  from './config/Config.service';

/**
 * Main application, starting the T721 API
 */
async function main() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new WinstonLoggerService('core')
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

    await app.listen(configService.get('API_PORT'));
}
main();
