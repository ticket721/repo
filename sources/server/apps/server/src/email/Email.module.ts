import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@lib/common/config/Config.module';
import { Config } from '@app/server/utils/Config.joi';
import { EmailDriver } from '@app/server/email/drivers/Email.driver.base';
import { ConfigService } from '@lib/common/config/Config.service';
import { DevDriver } from '@app/server/email/drivers/Dev.driver';
import { MailjetDriver } from '@app/server/email/drivers/Mailjet.driver';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ShutdownModule } from '@lib/common/shutdown/Shutdown.module';
import { EmailService } from '@app/server/email/Email.service';
import { BullModule, BullModuleOptions } from '@nestjs/bull';

/**
 * Module to load the EmailService and its EmailDriver
 */
@Global()
@Module({
    imports: [
        ConfigModule.register(Config),
        ShutdownModule,
        BullModule.registerQueueAsync({
            imports: [ConfigModule.register(Config)],
            inject: [ConfigService],
            name: 'mailing',
            useFactory: (configService: ConfigService): BullModuleOptions => ({
                name: 'mailing',
                redis: {
                    host: configService.get('BULL_REDIS_HOST'),
                    port: parseInt(configService.get('BULL_REDIS_PORT'), 10),
                },
            }),
        }),
    ],
    providers: [
        {
            provide: EmailDriver,
            useFactory: (
                configService: ConfigService,
                shutdownService: ShutdownService,
            ): EmailDriver => {
                const emailEngine: string = configService.get('EMAIL_ENGINE');

                switch (emailEngine) {
                    case 'development': {
                        const emailDriver: EmailDriver = new DevDriver();
                        emailDriver.configure(configService);
                        return emailDriver;
                    }

                    case 'mailjet': {
                        const emailDriver: EmailDriver = new MailjetDriver();
                        emailDriver.configure(configService);
                        return emailDriver;
                    }

                    default: {
                        const error = new Error(
                            `Unknown mail engine ${emailEngine}`,
                        );
                        shutdownService.shutdownWithError(error);
                        throw error;
                    }
                }
            },
            inject: [ConfigService, ShutdownService],
        },
        EmailService,
    ],
    exports: [EmailService],
})
export class EmailModule {}
