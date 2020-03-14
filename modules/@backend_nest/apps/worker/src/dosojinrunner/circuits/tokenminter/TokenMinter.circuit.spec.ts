import { Job, JobOptions } from 'bull';
import {
    TokenMinterArguments,
    TokenMinterCircuit,
} from '@app/worker/dosojinrunner/circuits/tokenminter/TokenMinter.circuit';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { StripeTokenMinterDosojin } from '@app/worker/dosojinrunner/circuits/tokenminter/dosojins/StripeTokenMinter.dosojin';
import { deepEqual, instance, mock, spy, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { BN, Circuit, Gem } from 'dosojin';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }

    getJobs(...args: any[]): Promise<any> {
        return null;
    }

    process(...args: any[]): Promise<any> {
        return null;
    }
}

describe('TokenMinter Circuit', function() {
    const context: {
        tokenMinterCircuit: TokenMinterCircuit;
        dosojinQueueMock: QueueMock;
        shutdownServiceMock: ShutdownService;
        outrospectionServiceMock: OutrospectionService;
        gemOrdersServiceMock: GemOrdersService;
        stripeTokenMinterDosojin: StripeTokenMinterDosojin;
    } = {
        tokenMinterCircuit: null,
        dosojinQueueMock: null,
        shutdownServiceMock: null,
        outrospectionServiceMock: null,
        gemOrdersServiceMock: null,
        stripeTokenMinterDosojin: null,
    };

    beforeEach(async function() {
        context.dosojinQueueMock = mock(QueueMock);
        context.shutdownServiceMock = mock(ShutdownService);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.gemOrdersServiceMock = mock(GemOrdersService);
        context.stripeTokenMinterDosojin = mock(StripeTokenMinterDosojin);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: getQueueToken('dosojin'),
                    useValue: instance(context.dosojinQueueMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionServiceMock),
                },
                {
                    provide: GemOrdersService,
                    useValue: instance(context.gemOrdersServiceMock),
                },
                {
                    provide: StripeTokenMinterDosojin,
                    useValue: instance(context.stripeTokenMinterDosojin),
                },
                TokenMinterCircuit,
            ],
        }).compile();

        context.tokenMinterCircuit = app.get<TokenMinterCircuit>(TokenMinterCircuit);
    });

    describe('initialize', function() {
        it('should provide valid initialization arguments', async function() {
            const args: TokenMinterArguments = {
                paymentIntentId: 'pi_abcd',
                currency: 'eur',
                amount: 10000,
                userId: 'user',
                regionRestrictions: {
                    FR: {
                        fix_fee: 25,
                        variable_fee: 1.4,
                    },
                },
                methodsRestrictions: {
                    card: {
                        country_resolution_path: 'country',
                    },
                },
            };

            const gem = new Gem({
                fiat_eur: new BN(0),
            });

            const spiedCircuit = spy((context.tokenMinterCircuit as any).circuit as Circuit);

            when(spiedCircuit.createGem(deepEqual(gem), deepEqual(args))).thenResolve(gem);

            const res = await context.tokenMinterCircuit.initialize(args);

            expect(res.gemPayload.values).toEqual({
                fiat_eur: new BN(0),
            });
        });

        it('should fail on invalid args', async function() {
            const args: TokenMinterArguments = ({
                paymentIntentId: 'pi_abcd',
                currency: 'eur',
                userId: 'user',
                regionRestrictions: {
                    FR: {
                        fix_fee: 25,
                        variable_fee: 1.4,
                    },
                },
                methodsRestrictions: {
                    card: {
                        country_resolution_path: 'country',
                    },
                },
            } as any) as TokenMinterArguments;

            await expect(context.tokenMinterCircuit.initialize(args)).rejects.toMatchObject(
                new TypeError(`"amount" is required`),
            );
        });
    });
});
