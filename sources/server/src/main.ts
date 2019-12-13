import { NestFactory }            from '@nestjs/core';
import { AppModule }              from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Main application, starting the T721 API
 */
async function main() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const options = new DocumentBuilder()
        .setTitle('T721 API')
        .setDescription('')
        .setVersion('1.0.0')
        .addTag('t721')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
}
main();
