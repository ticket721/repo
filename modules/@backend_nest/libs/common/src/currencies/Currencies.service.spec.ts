import { CurrenciesService } from '@lib/common/currencies/Currencies.service';
import { Contracts, ContractsService } from '@lib/common/contracts/Contracts.service';
import { instance, mock, when } from 'ts-mockito';
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
    it('should load valid currencies config', async function() {
        const configPath = '/Users/configs/currencies.json';
        const config = [
            {
                name: 'T721Token',
                type: 'erc20',
                loadType: 'module',
                dollarPeg: 1,
                moduleName: 't721token',
                contractName: 'T721Token',
            },
            {
                name: 'Dai',
                type: 'erc20',
                loadType: 'address',
                dollarPeg: 1,
                moduleName: 't721token',
                contractName: 'IERC20',
                contractAddress: daiAddress,
            },
            {
                name: 'Fiat',
                type: 'set',
                contains: ['Dai', 'T721Token'],
            },
        ];

        const context: {
            currenciesService: CurrenciesService;
            contractsServiceMock: ContractsService;
            web3ServiceMock: Web3Service;
            shutdownServiceMock: ShutdownService;
            fsServiceMock: FSService;
        } = {
            currenciesService: null,
            contractsServiceMock: null,
            web3ServiceMock: null,
            shutdownServiceMock: null,
            fsServiceMock: null,
        };

        context.contractsServiceMock = mock(ContractsService);
        context.web3ServiceMock = mock(Web3Service);
        context.shutdownServiceMock = mock(ShutdownService);
        context.fsServiceMock = mock(FSService);

        when(context.fsServiceMock.readFile(configPath)).thenReturn(JSON.stringify(config));

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
                {
                    provide: FSService,
                    useValue: instance(context.fsServiceMock),
                },
                {
                    provide: 'CURRENCIES_MODULE_OPTIONS',
                    useValue: configPath,
                },
                CurrenciesService,
            ],
        }).compile();

        context.currenciesService = app.get<CurrenciesService>(CurrenciesService);

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
        when(context.contractsServiceMock.getContractArtifacts()).thenResolve((contractArtifact as any) as Contracts);

        const t721token = await context.currenciesService.get('T721Token');
        const dai = await context.currenciesService.get('Dai');
        const fiat = await context.currenciesService.get('Fiat');
    });

    it('should throw on config fail', async function() {
        const configPath = '/Users/configs/currencies.json';
        const config = [
            {
                name: 'T721Token',
                type: 'erc721',
                loadType: 'module',
                dollarPeg: 1,
                moduleName: 't721token',
                contractName: 'T721Token',
            },
            {
                name: 'Dai',
                type: 'erc20',
                loadType: 'address',
                dollarPeg: 1,
                moduleName: 't721token',
                contractName: 'IERC20',
                contractAddress: daiAddress,
            },
            {
                name: 'Fiat',
                type: 'set',
                contains: ['Dai', 'T721Token'],
            },
        ];

        const context: {
            currenciesService: CurrenciesService;
            contractsServiceMock: ContractsService;
            web3ServiceMock: Web3Service;
            shutdownServiceMock: ShutdownService;
            fsServiceMock: FSService;
        } = {
            currenciesService: null,
            contractsServiceMock: null,
            web3ServiceMock: null,
            shutdownServiceMock: null,
            fsServiceMock: null,
        };

        context.contractsServiceMock = mock(ContractsService);
        context.web3ServiceMock = mock(Web3Service);
        context.shutdownServiceMock = mock(ShutdownService);
        context.fsServiceMock = mock(FSService);

        when(context.fsServiceMock.readFile(configPath)).thenReturn(JSON.stringify(config));

        await expect(
            Test.createTestingModule({
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
                    {
                        provide: FSService,
                        useValue: instance(context.fsServiceMock),
                    },
                    {
                        provide: 'CURRENCIES_MODULE_OPTIONS',
                        useValue: configPath,
                    },
                    CurrenciesService,
                ],
            }).compile(),
        ).rejects.toMatchObject(new Error('Currencies validation error: "[0].type" must be one of [erc20, set]'));
    });
});
