import { Job, JobOptions, Queue } from 'bull';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { TxsService } from '@lib/common/txs/Txs.service';
import { getQueueToken, InjectQueue } from '@nestjs/bull';
import { TxSeqEventHandlers } from '@app/worker/actionhandlers/txseq/TxSeq.event.handlers';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { MintingTasks } from '@app/worker/tasks/minting/Minting.tasks';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Action } from '@lib/common/actionsets/helper/Action.class';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

describe('TxSeq Event Handler', function() {
    const context: {
        txSeqEventHandler: TxSeqEventHandlers;
        actionSetsServiceMock: ActionSetsService;
        txsServiceMock: TxsService;
        txQueueMock: QueueMock;
    } = {
        txSeqEventHandler: null,
        actionSetsServiceMock: null,
        txsServiceMock: null,
        txQueueMock: null,
    };

    beforeEach(async function() {
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.txsServiceMock = mock(TxsService);
        context.txQueueMock = mock(QueueMock);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: TxsService,
                    useValue: instance(context.txsServiceMock),
                },
                {
                    provide: getQueueToken('tx'),
                    useValue: instance(context.txQueueMock),
                },
                TxSeqEventHandlers,
            ],
        }).compile();

        context.txSeqEventHandler = app.get<TxSeqEventHandlers>(TxSeqEventHandlers);
    });

    describe('txHandlerHandler', function() {
        it('should properly handle transaction broadcast', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                            onFailure: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                    }),
            ]);
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            const tx: TxEntity = {
                transaction_hash: transactionHash,
            } as TxEntity;

            // MOCK
            when(context.txsServiceMock.sendRawTransaction(sender, receiver, '0', '0x')).thenResolve({
                error: null,
                response: tx,
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.data.broadcasted).toEqual(true);
            expect(res[0].action.data.transactionHash).toEqual(transactionHash);

            // CHECK CALLS
            verify(context.txsServiceMock.sendRawTransaction(sender, receiver, '0', '0x')).once();
        });

        it('should fail on invalid payload', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                            onFailure: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                    }),
            ]);
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            const tx: TxEntity = {
                transaction_hash: transactionHash,
            } as TxEntity;

            // MOCK
            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.error.error).toEqual('validation_error');

            // CHECK CALLS
        });

        it('should fail on incomplete payload', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({}),
            ]);
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            const tx: TxEntity = {
                transaction_hash: transactionHash,
            } as TxEntity;

            // MOCK
            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.error.error).toEqual('incomplete_error');

            // CHECK CALLS
        });

        it('should set error on transaction error', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                            onFailure: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                    }),
            ]);
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            const tx: TxEntity = {
                transaction_hash: transactionHash,
            } as TxEntity;

            // MOCK
            when(context.txsServiceMock.sendRawTransaction(sender, receiver, '0', '0x')).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.status).toEqual('error');
            expect(res[0].status).toEqual('event:error');
            expect(res[0].action.error.error).toEqual('unexpected_error');

            // CHECK CALLS
            verify(context.txsServiceMock.sendRawTransaction(sender, receiver, '0', '0x')).once();
        });

        it('should properly follow transaction progress', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                            onFailure: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                        broadcasted: true,
                        transactionHash,
                    }),
            ]);
            const tx: TxEntity = {
                transaction_hash: transactionHash,
                confirmed: true,
                status: true,
            } as TxEntity;

            // MOCK
            when(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [tx],
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.data.broadcasted).toEqual(true);
            expect(res[0].action.data.transactionHash).toEqual(transactionHash);

            // CHECK CALLS
            verify(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
            verify(
                context.txQueueMock.add(
                    'confirm',
                    deepEqual({
                        transactionHash,
                        status: 'confirm',
                    }),
                ),
            ).once();
        });

        it('should properly follow transaction progress without callback', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onFailure: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                        broadcasted: true,
                        transactionHash,
                    }),
            ]);
            const tx: TxEntity = {
                transaction_hash: transactionHash,
                confirmed: true,
                status: true,
            } as TxEntity;

            // MOCK
            when(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [tx],
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.data.broadcasted).toEqual(true);
            expect(res[0].action.data.transactionHash).toEqual(transactionHash);

            // CHECK CALLS
            verify(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
            verify(
                context.txQueueMock.add(
                    'confirm',
                    deepEqual({
                        transactionHash,
                        status: 'confirm',
                    }),
                ),
            ).never();
        });

        it('should properly follow failed transaction progress', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                            onFailure: {
                                name: 'failure',
                                jobData: {
                                    status: 'failure',
                                },
                            },
                        },
                        broadcasted: true,
                        transactionHash,
                    }),
            ]);
            const tx: TxEntity = {
                transaction_hash: transactionHash,
                confirmed: true,
                status: false,
            } as TxEntity;

            // MOCK
            when(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [tx],
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.data.broadcasted).toEqual(true);
            expect(res[0].action.data.transactionHash).toEqual(transactionHash);
            expect(res[0].action.error.error).toEqual('transaction_failed');

            // CHECK CALLS
            verify(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
            verify(
                context.txQueueMock.add(
                    'failure',
                    deepEqual({
                        transactionHash,
                        status: 'failure',
                    }),
                ),
            ).once();
        });

        it('should properly follow failed transaction progress without callback', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                        broadcasted: true,
                        transactionHash,
                    }),
            ]);
            const tx: TxEntity = {
                transaction_hash: transactionHash,
                confirmed: true,
                status: false,
            } as TxEntity;

            // MOCK
            when(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [tx],
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.data.broadcasted).toEqual(true);
            expect(res[0].action.data.transactionHash).toEqual(transactionHash);
            expect(res[0].action.error.error).toEqual('transaction_failed');

            // CHECK CALLS
            verify(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
            verify(
                context.txQueueMock.add(
                    'failure',
                    deepEqual({
                        transactionHash,
                        status: 'failure',
                    }),
                ),
            ).never();
        });

        it('should properly follow unconfirmed transaction progress', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                            onFailure: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                        broadcasted: true,
                        transactionHash,
                    }),
            ]);
            const tx: TxEntity = {
                transaction_hash: transactionHash,
                confirmed: false,
            } as TxEntity;

            // MOCK
            when(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [tx],
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.data.broadcasted).toEqual(true);
            expect(res[0].action.data.transactionHash).toEqual(transactionHash);

            // CHECK CALLS
            verify(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
        });

        it('should fail on transaction fetch error', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                            onFailure: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                        broadcasted: true,
                        transactionHash,
                    }),
            ]);
            const tx: TxEntity = {
                transaction_hash: transactionHash,
                confirmed: true,
                status: true,
            } as TxEntity;

            // MOCK
            when(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.data.broadcasted).toEqual(true);
            expect(res[0].action.data.transactionHash).toEqual(transactionHash);
            expect(res[0].action.error.error).toEqual('unexpected_error');

            // CHECK CALLS
            verify(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
        });

        it('should fail on empty transaction fetch', async function() {
            // DECLARE
            const sender = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const receiver = '0x6E76CffA383f080154ABc2d71c218ECaF637fCA1';
            const acset = new ActionSet();
            const transactionHash = '0xc5f68c44b070276f935ab91b6c5fbc210bc3f3224db2d9e67196e5356771e3cd';
            acset.setActions([
                new Action()
                    .setStatus('in progress')
                    .setType('event')
                    .setData({
                        transaction: {
                            from: sender,
                            to: receiver,
                            value: '0',
                            data: '0x',
                            onConfirm: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                            onFailure: {
                                name: 'confirm',
                                jobData: {
                                    status: 'confirm',
                                },
                            },
                        },
                        broadcasted: true,
                        transactionHash,
                    }),
            ]);
            const tx: TxEntity = {
                transaction_hash: transactionHash,
                confirmed: true,
                status: true,
            } as TxEntity;

            // MOCK
            when(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            // TRIGGER
            const res = await context.txSeqEventHandler.txHandlerHandler(['transaction'], acset, async () => {});

            // CHECK RETURNs
            expect(res[0].action.data.broadcasted).toEqual(true);
            expect(res[0].action.data.transactionHash).toEqual(transactionHash);
            expect(res[0].action.error.error).toEqual('transaction_not_found');

            // CHECK CALLS
            verify(
                context.txsServiceMock.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
        });
    });
});
