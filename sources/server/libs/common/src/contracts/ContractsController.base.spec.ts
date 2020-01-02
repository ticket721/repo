import {
    Contracts,
    ContractsService,
} from '@lib/common/contracts/Contracts.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';

const context: {
    contractsService: ContractsService;
    web3Service: Web3Service;
    shutdownService: ShutdownService;
} = {
    contractsService: null,
    web3Service: null,
    shutdownService: null,
};

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

describe('Contracts Controller Base', function() {
    beforeEach(function() {
        context.shutdownService = mock(ShutdownService);
        context.web3Service = mock(Web3Service);
        context.contractsService = mock(ContractsService);
    });

    it('should load contract instance', async function() {
        const contractName: string = 'module::ContractName';
        const contractsController = new ContractsControllerBase(
            instance(context.contractsService),
            instance(context.web3Service),
            instance(context.shutdownService),
            contractName,
        );

        const address: string = '0x87c02dec6b33498b489e1698801fc2ef79d02eef';
        const networkId: number = 2702;
        const contractArtifact = {
            [contractName]: {
                abi: ERC20_ABI,
                networks: {
                    [networkId]: {
                        address,
                    },
                },
            },
        };

        const Contract = class {
            constructor(abi: any, address: string) {}
        };

        const web3 = {
            eth: {
                Contract,
            },
        };

        when(context.contractsService.getContractArtifacts()).thenReturn(
            Promise.resolve((contractArtifact as any) as Contracts),
        );
        when(context.web3Service.net()).thenReturn(Promise.resolve(networkId));
        when(context.web3Service.get()).thenReturn(Promise.resolve(web3));

        expect(await contractsController.get()).toBeDefined();
        expect(await contractsController.get()).toBeDefined();

        verify(context.contractsService.getContractArtifacts()).called();
        verify(context.web3Service.net()).called();
        verify(context.web3Service.get()).called();
    });

    it('should throw for null contractData', async function() {
        const contractName: string = 'module::ContractName';
        const contractsController = new ContractsControllerBase(
            instance(context.contractsService),
            instance(context.web3Service),
            instance(context.shutdownService),
            contractName,
        );

        const contractArtifact = {
            [contractName]: null,
        };

        when(context.contractsService.getContractArtifacts()).thenReturn(
            Promise.resolve((contractArtifact as any) as Contracts),
        );

        const error = new Error(
            `Cannot recover artifact for instance called ${contractName}`,
        );

        await expect(contractsController.get()).rejects.toMatchObject(error);

        verify(context.contractsService.getContractArtifacts()).called();
        verify(context.web3Service.net()).never();
        verify(context.web3Service.get()).never();
        verify(
            context.shutdownService.shutdownWithError(deepEqual(error)),
        ).called();
    });

    it('should throw for null web3', async function() {
        const contractName: string = 'module::ContractName';
        const contractsController = new ContractsControllerBase(
            instance(context.contractsService),
            instance(context.web3Service),
            instance(context.shutdownService),
            contractName,
        );

        const address: string = '0x87c02dec6b33498b489e1698801fc2ef79d02eef';
        const networkId: number = 2702;
        const contractArtifact = {
            [contractName]: {
                abi: ERC20_ABI,
                networks: {
                    [networkId]: {
                        address,
                    },
                },
            },
        };

        const web3 = null;

        when(context.contractsService.getContractArtifacts()).thenReturn(
            Promise.resolve((contractArtifact as any) as Contracts),
        );
        when(context.web3Service.net()).thenReturn(Promise.resolve(networkId));
        when(context.web3Service.get()).thenReturn(Promise.resolve(web3));

        const error = new Error(
            `Unable to recover web3 instance or data for contract ${contractName}`,
        );

        await expect(contractsController.get()).rejects.toMatchObject(error);

        verify(context.contractsService.getContractArtifacts()).called();
        verify(context.web3Service.net()).called();
        verify(context.web3Service.get()).called();
        verify(
            context.shutdownService.shutdownWithError(deepEqual(error)),
        ).called();
    });

    it('should throw for null networkId', async function() {
        const contractName: string = 'module::ContractName';
        const contractsController = new ContractsControllerBase(
            instance(context.contractsService),
            instance(context.web3Service),
            instance(context.shutdownService),
            contractName,
        );

        const address: string = '0x87c02dec6b33498b489e1698801fc2ef79d02eef';
        const networkId: number = 2702;
        const contractArtifact = {
            [contractName]: {
                abi: ERC20_ABI,
                networks: {
                    [networkId]: {
                        address,
                    },
                },
            },
        };

        const Contract = class {
            constructor(abi: any, address: string) {}
        };

        const web3 = {
            eth: {
                Contract,
            },
        };

        when(context.contractsService.getContractArtifacts()).thenReturn(
            Promise.resolve((contractArtifact as any) as Contracts),
        );
        when(context.web3Service.net()).thenReturn(Promise.resolve(null));
        when(context.web3Service.get()).thenReturn(Promise.resolve(web3));

        const error = new Error(
            `Unable to recover web3 instance or data for contract ${contractName}`,
        );

        await expect(contractsController.get()).rejects.toMatchObject(error);

        verify(context.contractsService.getContractArtifacts()).called();
        verify(context.web3Service.net()).called();
        verify(context.web3Service.get()).called();
        verify(
            context.shutdownService.shutdownWithError(deepEqual(error)),
        ).called();
    });
});
