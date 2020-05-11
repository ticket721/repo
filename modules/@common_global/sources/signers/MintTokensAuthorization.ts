import { EIP712Signer }        from '@ticket721/e712';
import { encode }              from '../abi';
import { keccak256FromBuffer } from '../hash';

const Authorization = [
    {
        name: 'emitter',
        type: 'address',
    },
    {
        name: 'grantee',
        type: 'address',
    },
    {
        name: 'hash',
        type: 'bytes32',
    },
];

export class MintTokensAuthorization extends EIP712Signer {

    constructor(verifyingContract: string, chainId: number) {
        super(
            {
                name: 'T721 Admin',
                version: '0',
                chainId,
                verifyingContract,
            },
            ['Authorization', Authorization],
        );
    }

    static toCodesFormat(
        code: string,
    ): string {

        return [
            'uint256', code,
        ].join('_');
    }

    static toArgsFormat(
        recipient: string,
        amount: string,
        minter: string,
        code: string,
    ): string {

        return [
            'string', 'mintTokens',
            'address', recipient,
            'uint25', amount,
            'address', minter,
            'uint256', code
        ].join('_');
    }

    static toSelectorFormat(
        recipient: string,
        amount: string,
    ): string {

        return [
            'address', recipient,
            'uint256', amount,
        ].join('_');
    }

    static encodeAndHash(
        recipient: string,
        amount: string,
        minter: string,
        code: string,
    ): string {

        const encodedArguments = encode(
            ['string', 'address', 'uint256', 'address', 'uint256'],
            ['mintTokens', recipient, encode(['uint256'], [amount]), minter, encode(['uint256'], [code])],
        );

        const buffer = Buffer.from(encodedArguments.slice(2), 'hex');

        return keccak256FromBuffer(buffer);
    }

}

