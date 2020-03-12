import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from './Config.service';
import * as Joi from '@hapi/joi';
import * as path from 'path';

@Global()
@Module({})
export class ConfigModule {
    static register(joi: Joi.ObjectSchema, configPath: string): DynamicModule {
        return {
            module: ConfigModule,
            providers: [
                {
                    provide: ConfigService,
                    useValue: new ConfigService(joi, [
                        path.join(configPath, `${process.env.NODE_ENV || 'development'}.env`),
                        path.join(configPath, `${process.env.NODE_ENV || 'development'}.secret.env`),
                    ]),
                },
            ],
            exports: [ConfigService],
        };
    }
}
