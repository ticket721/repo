import { EIP712Signer } from '@ticket721/e712';

/**
 * Parameters of a single transaction
 */
export interface TransactionParameters {
    from: string;
    to: string;
    relayer: string;
    value: string;
    data: string;
}

/**
 * MetaTransaction data structure. Can hold several transactions for a signle call
 */
export interface MetaTransaction {
    parameters: TransactionParameters[];
    nonce: number;
}

/**
 * TransactionParameter E712 Type
 */
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

/**
 * MetaTransaction E712 Type
 */
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

/**
 * Meta Transaction signer class
 */
export class RefractMtx extends EIP712Signer {

    /**
     * EIP712Signer builder
     *
     * @param chainId
     * @param name
     * @param version
     * @param refract
     */
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
