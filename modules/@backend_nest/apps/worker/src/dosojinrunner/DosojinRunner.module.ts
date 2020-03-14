import { DynamicModule, Module } from '@nestjs/common';
import { TokenMinterCircuit } from '@app/worker/dosojinrunner/circuits/tokenminter/TokenMinter.circuit';
import { DosojinRunnerScheduler } from '@app/worker/dosojinrunner/DosojinRunner.scheduler';
import { GemOrdersModule } from '@lib/common/gemorders/GemOrders.module';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@lib/common/config/Config.service';
import { StripeTokenMinterDosojin } from '@app/worker/dosojinrunner/circuits/tokenminter/dosojins/StripeTokenMinter.dosojin';
import { Stripe } from 'stripe';
import { UsersModule } from '@lib/common/users/Users.module';
import { TxsModule } from '@lib/common/txs/Txs.module';
import { TxsServiceOptions } from '@lib/common/txs/Txs.service';

/**
 * Build options for the Dosojin Module
 */
export interface DosojinRunnerModuleBuildOptions {
    /**
     * Stripe Private Key to give to the Stripe Dosojin
     */
    stripePrivateKey: string;
}

/**
 * Dosojin Module Async Build Options
 */
export interface DosojinRunnerModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to recover the build parameters in an asynchronous manner
     *
     * @param args
     */
    useFactory: (...args: any[]) => Promise<DosojinRunnerModuleBuildOptions> | DosojinRunnerModuleBuildOptions;

    /**
     * Providers and qrguments to inject
     */
    inject?: any[];
}

/**
 * Dosojin Runner Module, in charge of all the circuit and all Gem Orders
 */
@Module({})
export class DosojinRunnerModule {
    /**
     * Async Module Registration
     *
     * @param options
     */
    static registerAsync(options: DosojinRunnerModuleAsyncOptions): DynamicModule {
        return {
            module: DosojinRunnerModule,
            imports: [
                ...(options.imports ? options.imports : []),
                GemOrdersModule,
                UsersModule,
                TxsModule.registerAsync({
                    useFactory: (configService: ConfigService): TxsServiceOptions => ({
                        blockThreshold: parseInt(configService.get('TXS_BLOCK_THRESHOLD'), 10),
                        blockPollingRefreshRate: parseInt(configService.get('TXS_BLOCK_POLLING_REFRESH_RATE'), 10),
                        ethereumNetworkId: parseInt(configService.get('ETHEREUM_NODE_NETWORK_ID'), 10),
                        ethereumMtxDomainName: configService.get('ETHEREUM_MTX_DOMAIN_NAME'),
                        ethereumMtxVersion: configService.get('ETHEREUM_MTX_VERSION'),
                        ethereumMtxRelayAdmin: configService.get('VAULT_ETHEREUM_ASSIGNED_ADMIN'),
                        targetGasPrice: parseInt(configService.get('TXS_TARGET_GAS_PRICE'), 10),
                    }),
                    inject: [ConfigService],
                }),
                BullModule.registerQueueAsync({
                    inject: [ConfigService],
                    name: 'dosojin',
                    useFactory: (configService: ConfigService): BullModuleOptions => ({
                        name: 'dosojin',
                        redis: {
                            host: configService.get('BULL_REDIS_HOST'),
                            port: parseInt(configService.get('BULL_REDIS_PORT'), 10),
                        },
                    }),
                }),
            ],
            providers: [
                TokenMinterCircuit,
                DosojinRunnerScheduler,

                // Dosojins
                {
                    provide: 'STRIPE_INSTANCE',
                    useFactory: async (...args: any[]): Promise<Stripe> => {
                        const srmbuildOptions: DosojinRunnerModuleBuildOptions = await options.useFactory(...args);

                        return new Stripe(srmbuildOptions.stripePrivateKey, {
                            apiVersion: '2019-12-03',
                        });
                    },
                    inject: options.inject,
                },
                StripeTokenMinterDosojin,
            ],
        };
    }
}
