import { CircuitContainerBase } from '@app/worker/dosojinrunner/circuits/CircuitContainer.base';
import { Circuit, Gem, SingleDosojinLayer, BN } from 'dosojin';
import { ObjectSchema, object, string, number } from '@hapi/joi';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { StripeTokenMinterDosojin } from '@app/worker/dosojinrunner/circuits/tokenminter/dosojins/StripeTokenMinter.dosojin';

/**
 * Token Minter Circuit Initialization Arguments
 */
export interface TokenMinterArguments {
    /**
     * Payment Intent to use in order to mint tokens
     */
    paymentIntentId: string;

    /**
     * Currency to accept for the Payment Intent
     */
    currency: string;

    /**
     * Net Amount required after capture
     */
    amount: number;

    /**
     * Regions allowed + fees
     */
    regionRestrictions: {
        [key: string]: {
            /**
             * Variable Fee for given country
             */
            variable_fee: number;

            /**
             * Fix Fee to given country
             */
            fix_fee: number;
        };
    };

    /**
     * Allowed Payment Methods
     */
    methodsRestrictions: {
        [key: string]: {
            /**
             * Path to recover the payment method country
             */
            country_resolution_path: string;
        };
    };

    /**
     * ID of the user posting the payment intent id
     */
    userId: string;
}

/**
 * Dynamic Type Checker
 */
const TokenMinterVerifier: ObjectSchema<TokenMinterArguments> = object({
    paymentIntentId: string().required(),
    currency: string()
        .valid('eur')
        .required(),
    amount: number().required(),
    regionRestrictions: object({
        FR: object({
            variable_fee: number().required(),
            fix_fee: number().required(),
        }),
    }),
    methodsRestrictions: object({
        card: object({
            country_resolution_path: string().required(),
        }),
    }),
    userId: string(),
});

/**
 * Circuit to mint tokens upon succesful card payment
 */
export class TokenMinterCircuit extends CircuitContainerBase<TokenMinterArguments> {
    /**
     * Dependency Injection
     *
     * @param dosojinQueue
     * @param shutdownService
     * @param outrospectionService
     * @param gemOrdersService
     * @param stripeTokenMinterDosojin
     */
    constructor(
        @InjectQueue('dosojin') dosojinQueue: Queue,
        shutdownService: ShutdownService,
        outrospectionService: OutrospectionService,
        gemOrdersService: GemOrdersService,
        stripeTokenMinterDosojin: StripeTokenMinterDosojin,
    ) {
        const stripeLayer: SingleDosojinLayer = new SingleDosojinLayer('stripe');

        const circuit: Circuit = new Circuit('token_minting', [stripeLayer]);

        stripeLayer.setDosojin(stripeTokenMinterDosojin);

        const logger = new WinstonLoggerService('TokenMinter');

        super(
            circuit,
            TokenMinterVerifier,
            logger,
            outrospectionService,
            dosojinQueue,
            shutdownService,
            gemOrdersService,
        );
    }

    /**
     * Overriden initialization method
     *
     * @param args
     */
    public async initialize(args: TokenMinterArguments): Promise<Gem> {
        const { error, value: validatedArguments } = this.initialArgumentsVerifier.validate(args);

        if (error) {
            throw error;
        }

        const gem = this.circuit.createGem(
            new Gem({
                fiat_eur: new BN(0),
            }),
            validatedArguments,
        );

        return gem;
    }
}
