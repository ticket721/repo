import { CheckoutAcsetlifecycleHelper } from '@lib/common/checkout/acset_lifecycles/Checkout.acsetlifecycles.helper';
import { Job, JobOptions } from 'bull';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import ts from 'typescript';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Action } from '@lib/common/actionsets/helper/Action.class';
import { getQueueToken } from '@nestjs/bull';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';

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

describe('Checkout Acsetlifecycle Helper', function() {
    const context: {
        checkoutAcsetlifecycleHelper: CheckoutAcsetlifecycleHelper;
        mintingQueueMock: QueueMock;
        actionSetsServiceMock: ActionSetsService;
        categoriesServiceMock: CategoriesService;
    } = {
        checkoutAcsetlifecycleHelper: null,
        mintingQueueMock: null,
        actionSetsServiceMock: null,
        categoriesServiceMock: null,
    };

    beforeEach(async function() {
        context.mintingQueueMock = mock(QueueMock);
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.categoriesServiceMock = mock(CategoriesService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: getQueueToken('minting'),
                    useValue: instance(context.mintingQueueMock),
                },
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                CheckoutAcsetlifecycleHelper,
            ],
        }).compile();

        context.checkoutAcsetlifecycleHelper = app.get<CheckoutAcsetlifecycleHelper>(CheckoutAcsetlifecycleHelper);
    });

    describe('onComplete', function() {
        it('should add a new minting task', async function() {
            // DECLARE
            const cartId = 'cartid';
            const gemOrderId = 'gemorderid';
            const actionSet = new ActionSet();
            const actionSetId = 'actionsetid';
            actionSet
                .setActions([
                    new Action().setData({
                        cartId,
                        stripe: {
                            gemOrderId,
                        },
                    }),
                ])
                .setId(actionSetId);

            // MOCK
            when(
                context.mintingQueueMock.add(
                    'ticketMintingTransactionSequenceBuilderTask',
                    deepEqual({
                        cartActionSetId: cartId,
                        checkoutActionSetId: actionSetId,
                        gemOrderId: gemOrderId,
                    }),
                ),
            ).thenResolve();

            // TRIGGER
            const res = await context.checkoutAcsetlifecycleHelper.onComplete(actionSet);

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.mintingQueueMock.add(
                    'ticketMintingTransactionSequenceBuilderTask',
                    deepEqual({
                        cartActionSetId: cartId,
                        checkoutActionSetId: actionSetId,
                        gemOrderId: gemOrderId,
                    }),
                ),
            ).once();
        });

        it('should add a new minting task without gemOrder', async function() {
            // DECLARE
            const cartId = 'cartid';
            const actionSet = new ActionSet();
            const actionSetId = 'actionsetid';
            actionSet
                .setActions([
                    new Action().setData({
                        cartId,
                    }),
                ])
                .setId(actionSetId);

            // MOCK
            when(
                context.mintingQueueMock.add(
                    'ticketMintingTransactionSequenceBuilderTask',
                    deepEqual({
                        cartActionSetId: cartId,
                        checkoutActionSetId: actionSetId,
                        gemOrderId: undefined,
                    }),
                ),
            ).thenResolve();

            // TRIGGER
            const res = await context.checkoutAcsetlifecycleHelper.onComplete(actionSet);

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.mintingQueueMock.add(
                    'ticketMintingTransactionSequenceBuilderTask',
                    deepEqual({
                        cartActionSetId: cartId,
                        checkoutActionSetId: actionSetId,
                        gemOrderId: undefined,
                    }),
                ),
            ).once();
        });
    });
});
