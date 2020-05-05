import { EIP712Signer }        from '@ticket721/e712';
import { encode }              from '../abi';
import { keccak256FromBuffer } from '../hash';
import { decimalToHex, toB32 } from '../utils';

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
        expiration: number,
    ): string {

        return [
            'string', 'mint',
            'bytes', prices,
            'bytes32', groupId,
            'bytes32', category,
            'uint256', code,
            'uint256', expiration.toString(),
        ].join('_');
    }

    static toSelectorFormat(
        groupId: string,
        category: string,
    ): string {

        return [
            'bytes32', groupId,
            'bytes32', category,
        ].join('_');
    }

    encodeAndHash(
        prices: string,
        groupId: string,
        category: string,
        code: string,
        expiration: number,
    ): string {

        const encodedArguments = encode(
            ['string', 'bytes', 'bytes32', 'bytes32', 'uint256', 'uint256'],
            ['mint', prices, groupId, category, encode(['uint256'], [code]), encode(['uint256'], [expiration])],
        );

        const buffer = Buffer.from(encodedArguments.slice(2), 'hex');

        return keccak256FromBuffer(buffer);
    }

    static encodePrices(
        prices: {
            currency: string;
            value: string;
            fee: string;
        }[],
    ): string {

        let ret = `0x`;

        for (const price of prices) {
            ret = `${ret}${encode(['uint256'], [price.value]).slice(2)}${encode(['uint256'], [price.fee]).slice(2)}${encode(['address'], [price.currency]).slice(2)}`;
        }

        return ret;

    }

    static getMethodArgs(eventId: string, controller: string, feeCollector: string, buyers: string[], categories: string[], currencies: string[], amounts: string[], fees: string[], codes: string[], signatures: string[], expiration: string, scopeIndex: string): [
        string,
        string[],
        string[],
        string[],
        string
    ] {
        if (buyers.length !== categories.length || categories.length !== codes.length || codes.length !== signatures.length) {
            throw new Error(`Invalid ticket arguments: one of buyers, categories, codes and signatures has an invalid length`);
        }

        if (currencies.length !== amounts.length && amounts.length !== fees.length) {
            throw new Error(`Invalid currency arguments: one of currencies, amounts and fees has an invalid length`);
        }

        const b32: string[] = [];
        const uints: string[] = [];
        const addr: string[] = [];
        let bs: string = '0x';

        uints.push(currencies.length.toString());
        uints.push(expiration);
        addr.push(controller);
        addr.push(feeCollector);

        for (let idx = 0; idx < currencies.length; ++idx) {
            uints.push(amounts[idx]);
            uints.push(fees[idx]);
            addr.push(currencies[idx]);
        }

        uints.push(categories.length.toString());

        for (let idx = 0; idx < buyers.length; ++idx) {
            b32.push(toB32(categories[idx]));
            uints.push(codes[idx]);
            uints.push(scopeIndex);
            addr.push(buyers[idx]);
            bs = `${bs}${signatures[idx].slice(2)}`;
        }

        return [
            eventId,
            b32,
            uints.map((num: string) => decimalToHex(num)),
            addr,
            bs,
        ];
    }

}

