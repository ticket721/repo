import { EIP712Signer } from '@ticket721/e712';

export interface TransactionParameters {
    from: string;
    to: string;
    relayer: string;
    value: string;
    data: string;
}

export interface MetaTransaction {
    parameters: TransactionParameters[];
    nonce: number;
}

const TransactionParametersType = [
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
];

const MetaTransactionType = [
    {
        name: 'parameters',
        type: 'TransactionParameters[]',
    },
    {
        name: 'nonce',
        type: 'uint256',
    },
];

export class RefractMtx extends EIP712Signer {
    constructor(chainId: number, name: string, version: string, refract: string) {
        super(
            {
                name,
                version,
                chainId,
                verifyingContract: refract,
            },
            ['TransactionParameters', TransactionParametersType],
            ['MetaTransaction', MetaTransactionType],
        );
    }
}
