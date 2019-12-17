import { Module }        from '@nestjs/common';
import { ConfigService } from './Config.service';

@Module({
    providers: [
        {
            provide: ConfigService,
            useValue: new ConfigService(`env/${process.env.NODE_ENV || 'development'}.env`),
        },
    ],
    exports: [ConfigService],
})
export class ConfigModule {
}
