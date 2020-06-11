import { EIP712Signer }                     from '@ticket721/e712';
import { encode, getT721ControllerGroupID } from '../abi';
import { keccak256FromBuffer }              from '../hash';

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

export class WithdrawAuthorization extends EIP712Signer {

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
        eventController: string,
        eventId: string,
        currency: string,
        amount: string,
        target: string,
        code: string,
        expiration: number,
    ): string {

        return [
            'string', 'withdraw',
            'address', eventController,
            'string', eventId,
            'address', currency,
            'uint256', amount,
            'address', target,
            'uint256', code,
            'uint256', expiration.toString(),
        ].join('_');
    }

    static toSelectorFormat(
        eventController: string,
        eventId: string,
    ): string {

        return [
            'address', eventController,
            'string', eventId,
        ].join('_');
    }

    encodeAndHash(
        eventController: string,
        eventId: string,
        currency: string,
        amount: string,
        target: string,
        code: string,
        expiration: number,
    ): string {

        const groupID = getT721ControllerGroupID(eventId, eventController);

        const encodedArguments = encode(
            ['string', 'bytes32', 'address', 'uint256', 'address', 'uint256', 'uint256'],
            ['withdraw', groupID, currency, encode(['uint256'], [amount]), target, encode(['uint256'], [code]), encode(['uint256'], [expiration])],
        );

        const buffer = Buffer.from(encodedArguments.slice(2), 'hex');

        return keccak256FromBuffer(buffer);
    }

    static getMethodArgs(
        eventController: string,
        eventId: string,
        currency: string,
        amount: string,
        target: string,
        code: string,
        expiration: number,
        signature: string,
    ): [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
    ] {
        return [
            eventController,
            eventId,
            currency,
            encode(['uint256'], [amount]),
            target,
            encode(['uint256'], [code]),
            encode(['uint256'], [expiration]),
            signature
        ]
    }

}

