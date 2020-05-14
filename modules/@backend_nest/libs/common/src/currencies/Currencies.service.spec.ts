import { CurrenciesService, ERC20Currency } from '@lib/common/currencies/Currencies.service';
import { Contracts, ContractsService } from '@lib/common/contracts/Contracts.service';
import { instance, mock, spy, verify, when } from 'ts-mockito';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { FSService } from '@lib/common/fs/FS.service';
import { Test, TestingModule } from '@nestjs/testing';

const daiAddress = '0x87c02dec6b33498b489e1698801fc2ef79d02eef';

const ERC20_ABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                internalType: 'address',
                name: 'recipient',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'recipient',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'addedValue',
                type: 'uint256',
            },
        ],
        name: 'increaseAllowance',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'subtractedValue',
                type: 'uint256',
            },
        ],
        name: 'decreaseAllowance',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
];

describe('Currencies Service', function() {
    const context: {
        currenciesService: CurrenciesService;
        contractsServiceMock: ContractsService;
        web3ServiceMock: Web3Service;
        shutdownServiceMock: ShutdownService;
    } = {
        currenciesService: null,
        contractsServiceMock: null,
        web3ServiceMock: null,
        shutdownServiceMock: null,
    };

    beforeEach(async function() {
        context.contractsServiceMock = mock(ContractsService);
        context.web3ServiceMock = mock(Web3Service);
        context.shutdownServiceMock = mock(ShutdownService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ContractsService,
                    useValue: instance(context.contractsServiceMock),
                },
                {
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                CurrenciesService,
            ],
        }).compile();

        context.currenciesService = app.get<CurrenciesService>(CurrenciesService);
    });

    describe('resolveInputPrices', function() {
        it('should properly resolve currencies', async function() {
            const Contract = class {
                constructor(abi: any, address: string) {}
            };

            const web3 = {
                eth: {
                    Contract,
                },
            };

            const address: string = '0x87c02dec6b33498b489e1698801fc2ef79d02eef';
            const networkId: number = 2702;

            const contractArtifact = {
                [`t721token::IERC20`]: {
                    abi: ERC20_ABI,
                    networks: {
                        [networkId]: {
                            address: daiAddress,
                        },
                    },
                },
                [`t721token::T721Token`]: {
                    abi: ERC20_ABI,
                    networks: {
                        [networkId]: {
                            address,
                        },
                    },
                },
            };

            when(context.web3ServiceMock.get()).thenResolve(web3);
            when(context.web3ServiceMock.net()).thenResolve(networkId);
            when(context.contractsServiceMock.getContractArtifacts()).thenResolve(
                (contractArtifact as any) as Contracts,
            );

            const prices = await context.currenciesService.resolveInputPrices([
                {
                    currency: 'Fiat',
                    price: '100',
                },
            ]);

            expect(prices.error).toEqual(null);
            expect(prices.response).toEqual([
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 6.643856189774724,
                },
            ]);
        });

        it('should properly resolve currencies and ignore duplicates', async function() {
            const Contract = class {
                constructor(abi: any, address: string) {}
            };

            const web3 = {
                eth: {
                    Contract,
                },
            };

            const address: string = '0x87c02dec6b33498b489e1698801fc2ef79d02eef';
            const networkId: number = 2702;

            const contractArtifact = {
                [`t721token::IERC20`]: {
                    abi: ERC20_ABI,
                    networks: {
                        [networkId]: {
                            address: daiAddress,
                        },
                    },
                },
                [`t721token::T721Token`]: {
                    abi: ERC20_ABI,
                    networks: {
                        [networkId]: {
                            address,
                        },
                    },
                },
            };

            when(context.web3ServiceMock.get()).thenResolve(web3);
            when(context.web3ServiceMock.net()).thenResolve(networkId);
            when(context.contractsServiceMock.getContractArtifacts()).thenResolve(
                (contractArtifact as any) as Contracts,
            );

            const prices = await context.currenciesService.resolveInputPrices([
                {
                    currency: 'Fiat',
                    price: '100',
                },
                {
                    currency: 'Fiat',
                    price: '100',
                },
                {
                    currency: 'T721Token',
                    price: '100',
                },
            ]);

            expect(prices.error).toEqual(null);
            expect(prices.response).toEqual([
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 6.643856189774724,
                },
            ]);
        });

        it('should fail on invalid currency', async function() {
            const Contract = class {
                constructor(abi: any, address: string) {}
            };

            const web3 = {
                eth: {
                    Contract,
                },
            };

            const address: string = '0x87c02dec6b33498b489e1698801fc2ef79d02eef';
            const networkId: number = 2702;

            const contractArtifact = {
                [`t721token::IERC20`]: {
                    abi: ERC20_ABI,
                    networks: {
                        [networkId]: {
                            address: daiAddress,
                        },
                    },
                },
                [`t721token::T721Token`]: {
                    abi: ERC20_ABI,
                    networks: {
                        [networkId]: {
                            address,
                        },
                    },
                },
            };

            when(context.web3ServiceMock.get()).thenResolve(web3);
            when(context.web3ServiceMock.net()).thenResolve(networkId);
            when(context.contractsServiceMock.getContractArtifacts()).thenResolve(
                (contractArtifact as any) as Contracts,
            );

            const spiedService = spy(context.currenciesService);

            when(spiedService.get('Fiat Punto')).thenResolve(undefined);

            const prices = await context.currenciesService.resolveInputPrices([
                {
                    currency: 'Fiat Punto',
                    price: '100',
                },
            ]);

            expect(prices.error).toEqual('invalid_currencies');
            expect(prices.response).toEqual(null);
        });
    });

    describe('computeFee', function() {
        it('should compute fee for T721Token', async function() {
            // DECLARE
            const currency = 'T721Token';
            const amount = '300';
            const spiedService = spy(context.currenciesService);

            // MOCK
            when(spiedService.get(currency)).thenResolve({
                feeComputer: (amount: string) => '0',
            } as ERC20Currency);

            // TRIGGER
            const res = await context.currenciesService.computeFee(currency, amount);

            // CHECK RETURNs
            expect(res).toEqual('0');

            // CHECK CALLS
            verify(spiedService.get(currency)).once();
        });

        it('should return default fee for Fiat', async function() {
            // DECLARE
            const currency = 'Fiat';
            const amount = '300';
            const spiedService = spy(context.currenciesService);

            // MOCK
            when(spiedService.get(currency)).thenResolve({} as ERC20Currency);

            // TRIGGER
            const res = await context.currenciesService.computeFee(currency, amount);

            // CHECK RETURNs
            expect(res).toEqual('0');

            // CHECK CALLS
            verify(spiedService.get(currency)).once();
        });
    });
});
