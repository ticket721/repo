import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService }         from './Config.service';
import * as Joi                  from '@hapi/joi';

@Module({})
export class ConfigModule {
    static forRoot(joi: Joi.ObjectSchema): DynamicModule {
        return {
            module: ConfigModule,
            providers: [
                {
                    provide: ConfigService,
                    useValue: new ConfigService(joi, `./apps/server/env/${process.env.NODE_ENV || 'development'}.env`),
                }
            ],
            exports: [
                ConfigService
            ]
        }
    }
}
