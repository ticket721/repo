import { RefractFactoryV0Service } from '@lib/common/contracts/refract/RefractFactory.V0.service';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { instance, mock, spy, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { ClassType } from 'class-transformer/ClassTransformer';

class ContractsControllerBaseMock {
    async get(): Promise<any> {
        return {
            methods: {
                nonce: () => ({
                    call: async () => 2,
                }),
                isController: () => ({
                    call: async () => true,
                }),
                mtx: () => ({
                    encodeABI: () => '0xabcdef',
                }),
            },
        };
    }
}

describe('RefractFactory V0 Service', function() {
    const context: {
        refractFactoryV0Service: RefractFactoryV0Service;
        contractsServiceMock: ContractsService;
        web3ServiceMock: Web3Service;
        shutdwonServiceMock: ShutdownService;
        contractsControllerBaseMock: ClassType<ContractsControllerBase>;
    } = {
        refractFactoryV0Service: null,
        contractsServiceMock: null,
        web3ServiceMock: null,
        shutdwonServiceMock: null,
        contractsControllerBaseMock: null,
    };

    beforeEach(async function() {
        context.contractsServiceMock = mock(ContractsService);
        context.web3ServiceMock = mock(Web3Service);
        context.shutdwonServiceMock = mock(ShutdownService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
                {
                    provide: ContractsService,
                    useValue: instance(context.contractsServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdwonServiceMock),
                },
                {
                    provide: 'CONTRACTS_CONTROLLER_BASE_CLASS',
                    useValue: ContractsControllerBaseMock,
                },
                RefractFactoryV0Service,
            ],
        }).compile();

        context.refractFactoryV0Service = app.get<RefractFactoryV0Service>(RefractFactoryV0Service);
    });

    describe('getNonce', function() {
        it('should recover nonce of non existing refract wallet', async function() {
            const refract = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85f';

            const web3 = {
                eth: {
                    getCode: async (addr: string) => '0x',
                },
            };

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.refractFactoryV0Service.getNonce(refract);

            expect(res).toEqual(0);

            verify(context.web3ServiceMock.get()).called();
        });

        it('should recover nonce of on chain wallet', async function() {
            const refract = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85f';

            const web3 = {
                eth: {
                    getCode: async (addr: string) => '0xabcd',
                },
            };

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.refractFactoryV0Service.getNonce(refract);

            expect(res).toEqual(2);

            verify(context.web3ServiceMock.get()).called();
        });
    });

    describe('isController', function() {
        it('should check controller of unexisting refract wallet', async function() {
            const refract = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85f';
            const controller = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85d';

            const web3 = {
                eth: {
                    getCode: async (addr: string) => '0x',
                },
            };

            const spiedGetter = spy(context.refractFactoryV0Service);
            when(spiedGetter.get()).thenResolve({
                methods: {
                    predict: () => ({
                        call: async () => refract,
                    }),
                },
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.refractFactoryV0Service.isController(refract, controller, 'abcd');

            expect(res).toEqual(true);

            verify(context.web3ServiceMock.get()).called();
            verify(spiedGetter.get()).called();
        });

        it('should check controller of unexisting refract wallet with invalid results', async function() {
            const refract = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85f';
            const controller = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85d';

            const web3 = {
                eth: {
                    getCode: async (addr: string) => '0x',
                },
            };

            const spiedGetter = spy(context.refractFactoryV0Service);
            when(spiedGetter.get()).thenResolve({
                methods: {
                    predict: () => ({
                        call: async () => controller,
                    }),
                },
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.refractFactoryV0Service.isController(refract, controller, 'abcd');

            expect(res).toEqual(false);

            verify(context.web3ServiceMock.get()).called();
            verify(spiedGetter.get()).called();
        });

        it('should check controller of existing refract wallet', async function() {
            const refract = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85f';
            const controller = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85d';

            const web3 = {
                eth: {
                    getCode: async (addr: string) => '0xabcd',
                },
            };

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.refractFactoryV0Service.isController(refract, controller, 'abcd');

            expect(res).toEqual(true);

            verify(context.web3ServiceMock.get()).called();
        });
    });

    describe('encodeCall', function() {
        it('should encode an mtx call on unexisting wallet', async function() {
            const refract = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85f';
            const controller = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85d';
            const salt = '0x77e78587a8faf8948e627ed3e9740b8054a545aa64730df06263970996fce882';
            const nonce = 0;
            const addr = [
                '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                '0x1eadac420E7599a355813e63E94250C3384Cc27d',
            ];
            const nums = ['0', '100', '0', '1380'];
            const bdata =
                '0x2ce6b76bda0d75cd410f364f9ab97332633229d1c9f458b0ab32e9294fcf635257f72d94ea348a0f89e61fe1069d8350f4d25229ef2c99c82da745fc5fb16f181cdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b0b5715575956199ac6b31399d7f10ed634f244989b8aac42132235d234524f6400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e500852000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e5008520000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e500852000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e5008520000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e500852000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e500852000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

            const web3 = {
                eth: {
                    getCode: async (addr: string) => '0x',
                },
            };

            const spied = spy(context.refractFactoryV0Service);

            when(spied.get()).thenResolve({
                _address: refract,
                methods: {
                    mtxAndDeploy: () => ({
                        encodeABI: () => '0x1234',
                    }),
                },
            });
            when(context.web3ServiceMock.get()).thenResolve(web3);

            (context.refractFactoryV0Service as any)._address = refract;

            const res = await context.refractFactoryV0Service.encodeCall(
                refract,
                controller,
                salt,
                nonce,
                addr,
                nums,
                bdata,
            );

            expect(res).toEqual([refract, '0x1234']);

            verify(context.web3ServiceMock.get()).called();
            verify(spied.get()).called();
        });

        it('should encode an mtx call on existing wallet', async function() {
            const refract = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85f';
            const controller = '0x5F0e8b014eB5C35f08D7A58AF2aB4b8bD458B85d';
            const salt = '0x77e78587a8faf8948e627ed3e9740b8054a545aa64730df06263970996fce882';
            const nonce = 0;
            const addr = [
                '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                '0x1eadac420E7599a355813e63E94250C3384Cc27d',
            ];
            const nums = ['0', '100', '0', '1380'];
            const bdata =
                '0x2ce6b76bda0d75cd410f364f9ab97332633229d1c9f458b0ab32e9294fcf635257f72d94ea348a0f89e61fe1069d8350f4d25229ef2c99c82da745fc5fb16f181cdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b0b5715575956199ac6b31399d7f10ed634f244989b8aac42132235d234524f6400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e500852000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e5008520000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e500852000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e5008520000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e500852000000000000000000000000000000000000000000000000000000005e4ed2f2000000000000000000000000000000000000000000000000000000005e500852000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000120938ea2c75e0268ccb2292b7885bf7b3f2f05a000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

            const web3 = {
                eth: {
                    getCode: async (addr: string) => '0xabcd',
                },
            };

            when(context.web3ServiceMock.get()).thenResolve(web3);

            (context.refractFactoryV0Service as any)._address = refract;

            const res = await context.refractFactoryV0Service.encodeCall(
                refract,
                controller,
                salt,
                nonce,
                addr,
                nums,
                bdata,
            );

            expect(res).toEqual([refract, '0xabcdef']);

            verify(context.web3ServiceMock.get()).called();
        });
    });
});
