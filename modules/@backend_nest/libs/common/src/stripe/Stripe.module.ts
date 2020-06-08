import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Stripe } from 'stripe';
import { StripeService } from '@lib/common/stripe/Stripe.service';

/**
 * Build options for the Stripe Module
 */
export interface StripeModuleBuildOptions {
    /**
     * Stripe Private Key to give to the Stripe client
     */
    stripePrivateKey: string;
}

/**
 * Stripe Module Async Build Options
 */
export interface StripeModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to recover the build parameters in an asynchronous manner
     *
     * @param args
     */
    useFactory: (...args: any[]) => Promise<StripeModuleBuildOptions> | StripeModuleBuildOptions;

    /**
     * Providers and qrguments to inject
     */
    inject?: any[];
}

/**
 * Stripe module to build and exposer the stripe client globaly
 */
@Global()
@Module({})
export class StripeModule {
    static registerAsync(options: StripeModuleAsyncOptions): DynamicModule {
        return {
            module: StripeModule,
            providers: [
                {
                    provide: 'STRIPE_INSTANCE',
                    useFactory: async (moduleRef: ModuleRef, ...args: any[]): Promise<Stripe> => {
                        try {
                            return await moduleRef.get('STRIPE_MOCK_INSTANCE', { strict: false });
                        } catch (
                            e
                            // tslint:disable-next-line:no-empty
                        ) {}

                        const srmbuildOptions: StripeModuleBuildOptions = await options.useFactory(...args);

                        return new Stripe(srmbuildOptions.stripePrivateKey, {
                            apiVersion: '2019-12-03',
                        });
                    },
                    inject: [ModuleRef, ...options.inject],
                },
                StripeService,
            ],
            exports: [StripeService],
        };
    }
}
