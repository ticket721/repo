import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@lib/common/config/Config.service';
import { ModuleRef } from '@nestjs/core';
import { Stripe } from 'stripe';
import { StripeService } from '@lib/common/stripe/Stripe.service';

@Global()
@Module({})
export class StripeModule {
    static register(): DynamicModule {
        return {
            module: StripeModule,
            providers: [
                {
                    provide: 'STRIPE_INSTANCE',
                    useFactory: async (moduleRef: ModuleRef, configService: ConfigService): Promise<Stripe> => {
                        try {
                            return await moduleRef.get('STRIPE_MOCK_INSTANCE', { strict: false });
                        } catch (
                            e
                            // tslint:disable-next-line:no-empty
                        ) {}

                        return new Stripe(configService.get('DOSOJIN_STRIPE_PRIVATE_KEY'), {
                            apiVersion: '2019-12-03',
                        });
                    },
                    inject: [ModuleRef, ConfigService],
                },
                StripeService,
            ],
            exports: [StripeService],
        };
    }
}
