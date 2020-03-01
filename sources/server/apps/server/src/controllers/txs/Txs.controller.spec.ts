import { TxsController } from '@app/server/controllers/txs/Txs.controller';
import { TxsService } from '@lib/common/txs/Txs.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ContractArtifact, ContractsService } from '@lib/common/contracts/Contracts.service';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { ContractsController } from '@app/server/controllers/contracts/Contracts.controller';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { StatusCodes } from '@lib/common/utils/codes';

describe('Txs Controller', function() {
    const context: {
        txsController: TxsController;
        txsServiceMock: TxsService;
        configServiceMock: ConfigService;
        contractsServiceMock: ContractsService;
    } = {
        txsController: null,
        txsServiceMock: null,
        configServiceMock: null,
        contractsServiceMock: null,
    };

    beforeAll(async function() {
        context.txsServiceMock = mock(TxsService);
        context.configServiceMock = mock(ConfigService);
        context.contractsServiceMock = mock(ContractsService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: TxsService,
                    useValue: instance(context.txsServiceMock),
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },
                {
                    provide: ContractsService,
                    useValue: instance(context.contractsServiceMock),
                },
            ],
            controllers: [TxsController],
        }).compile();

        context.txsController = app.get<TxsController>(TxsController);
    });

    describe('mtx', function() {
        it('should properly pass mtx arguments to txs service', async function() {
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: '3',
                    parameters: [
                        {
                            from: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                            to: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                            relayer: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                            data:
                                '0xdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                            value: '0',
                        },
                        {
                            from: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                            to: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                            relayer: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                            data:
                                '0xa032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b210000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b21000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd0000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b210000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b21000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd0000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b210000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b21000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            value: '0',
                        },
                    ],
                },
            };
            const signature =
                '0xa8e40d7354262a65d3b3dcc5f99921ed799216409470e239cefddb13d0b25871326e655509f78b5257fbf712b6df50c73a02c5dbbeb05cb14d649551d5beda121c';
            const user: UserDto = ({
                id: '3f96078f-2afe-40de-b544-5c8ca57e2f0d',
            } as any) as UserDto;

            when(context.txsServiceMock.mtx(deepEqual(payload), signature, user)).thenResolve({
                error: null,
                response: ({
                    transaction_hash: '0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33',
                    confirmed: false,
                    block_number: 0,
                } as any) as TxEntity,
            });

            const res = await context.txsController.mtx(
                {
                    payload,
                    signature,
                },
                user,
            );

            expect(res).toEqual({
                tx: ({
                    transaction_hash: '0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33',
                    confirmed: false,
                    block_number: 0,
                } as any) as TxEntity,
            });

            verify(context.txsServiceMock.mtx(deepEqual(payload), signature, user)).called();
        });

        it('should throw on error', async function() {
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: '3',
                    parameters: [
                        {
                            from: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                            to: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                            relayer: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                            data:
                                '0xdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                            value: '0',
                        },
                        {
                            from: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                            to: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                            relayer: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                            data:
                                '0xa032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d000000000000000000000000000000000000000000000000000000005e4acead000000000000000000000000000000000000000000000000000000005e4c040d0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b210000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b21000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd0000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b210000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b21000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd0000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b210000000000000000000000009e30ecc50dbf807b163ebf9da630afd86e018b21000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            value: '0',
                        },
                    ],
                },
            };
            const signature =
                '0xa8e40d7354262a65d3b3dcc5f99921ed799216409470e239cefddb13d0b25871326e655509f78b5257fbf712b6df50c73a02c5dbbeb05cb14d649551d5beda121c';
            const user: UserDto = ({
                id: '3f96078f-2afe-40de-b544-5c8ca57e2f0d',
            } as any) as UserDto;

            when(context.txsServiceMock.mtx(deepEqual(payload), signature, user)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.txsController.mtx(
                    {
                        payload,
                        signature,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'unexpected_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'unexpected_error',
                },
            });

            verify(context.txsServiceMock.mtx(deepEqual(payload), signature, user)).called();
        });
    });

    describe('infos', function() {
        it('should recover transaction informations', async function() {
            when(context.contractsServiceMock.getContractArtifacts()).thenResolve({
                't721admin::T721Admin': ({
                    networks: {
                        2702: {
                            address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        },
                    },
                } as any) as ContractArtifact,
            });
            when(context.configServiceMock.get('ETHEREUM_NODE_NETWORK_ID')).thenReturn('2702');

            const infos = await context.txsController.infos();

            expect(infos).toEqual({
                relayer: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
            });

            verify(context.contractsServiceMock.getContractArtifacts()).called();
            verify(context.configServiceMock.get('ETHEREUM_NODE_NETWORK_ID')).called();
        });
    });

    describe('subscribe', function() {
        it('should subscribe to transaction hash', async function() {
            const user: UserDto = ({
                id: '3f96078f-2afe-40de-b544-5c8ca57e2f0d',
            } as any) as UserDto;

            const transaction_hash = '0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33';

            when(context.txsServiceMock.subscribe(transaction_hash)).thenResolve({
                error: null,
                response: ({
                    transaction_hash: '0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33',
                    confirmed: false,
                    block_number: 0,
                } as any) as TxEntity,
            });

            const res = await context.txsController.subscribe(
                {
                    transaction_hash,
                },
                user,
            );

            verify(context.txsServiceMock.subscribe(transaction_hash)).called();
        });

        it('should fail on subscribe', async function() {
            const user: UserDto = ({
                id: '3f96078f-2afe-40de-b544-5c8ca57e2f0d',
            } as any) as UserDto;

            const transaction_hash = '0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33';

            when(context.txsServiceMock.subscribe(transaction_hash)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.txsController.subscribe(
                    {
                        transaction_hash,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'unexpected_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'unexpected_error',
                },
            });

            verify(context.txsServiceMock.subscribe(transaction_hash)).called();
        });

        it('should fail for invalid hash', async function() {
            const user: UserDto = ({
                id: '3f96078f-2afe-40de-b544-5c8ca57e2f0d',
            } as any) as UserDto;

            const transaction_hash = '0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a';

            await expect(
                context.txsController.subscribe(
                    {
                        transaction_hash,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_tx_hash',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_tx_hash',
                },
            });
        });
    });
});
