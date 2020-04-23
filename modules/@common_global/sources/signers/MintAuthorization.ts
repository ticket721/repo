import { EIP712Signer } from '@ticket721/e712';
import { encode }       from '../abi';
import { keccak256 }    from '../hash';

const Authorization = [
    {
        name: 'emitter',
        type: 'address'
    },
    {
        name: 'grantee',
        type: 'address'
    },
    {
        name: 'hash',
        type: 'bytes32'
    }
];

export class MintAuthorization extends EIP712Signer {

    constructor(verifyingContract: string, chainId: number) {
        super(
            {
                name: 'T721 Controller',
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
        prices: string,
        groupId: string,
        category: string,
        code: string,
        expiration: number
    ): string {

        return [
            'string', 'mint',
            'bytes', prices,
            'bytes32', groupId,
            'bytes32', category,
            'uint256', code,
            'uint256', expiration.toString()
        ].join('_');
    }

    static toSelectorFormat(
        groupId: string,
        category: string,
    ): string {

        return [
            'bytes32', groupId,
            'bytes32', category
        ].join('_');
    }

    encodeAndHash(
        prices: string,
        groupId: string,
        category: string,
        code: string,
        expiration: number
    ): string {

        const encodedArguments = encode(
            ['string', 'bytes', 'bytes32', 'bytes32', 'uint256', 'uint256'],
            ['mint', prices, groupId, category, code, expiration]
        );

        return keccak256(encodedArguments);
    }

    static encodePrices(
        prices: {
            currency: string;
            value: string;
        }[]
    ): string {

        let ret = `0x`;

        for (const price of prices) {
            ret = `${ret}${price.currency.slice(2)}${price.value.slice(2)}`;
        }

        return ret;

    }

}

