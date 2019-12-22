import { EIP712Signer, EIP712Signature, EIP712Payload } from '@ticket721/e712';
import { toAcceptedAddressFormat }                      from '../address';

const Web3Register = [
    {
        type: 'uint256',
        name: 'timestamp'
    },
    {
        type: 'string',
        name: 'email'
    },
    {
        type: 'string',
        name: 'username'
    }
];

export class Web3RegisterSigner extends EIP712Signer {

    constructor(chain_id: number) {
        super(
            {
                name: 'Ticket721 Web3 Register',
                version: '0',
                chainId: chain_id,
                verifyingContract: '0x0000000000000000000000000000000000000000'
            },
            ['Web3Register', Web3Register]
        )
    }

    public generateRegistrationProofPayload(email: string, username: string): [number, EIP712Payload] {
        const timestamp = Date.now();
        return [timestamp, this.generatePayload({
            timestamp,
            email,
            username
        }, 'Web3Register')]
    }

    public async generateRegistrationProof(email: string, username: string, privateKey: string): Promise<[number, EIP712Signature]> {
        const timestamp = Date.now();
        const payload = this.generatePayload({
            timestamp,
            email,
            username
        }, 'Web3Register');

        const sig: EIP712Signature = await this.sign(privateKey, payload);

        return [timestamp, sig];
    }

    public async verifyRegistrationProof(signature: string, timestamp: number, email: string, username: string, timeout: number): Promise<[boolean, string]> {

        const now = Date.now();
        if (now - timeout > timestamp) {
            return [false, 'signature_timed_out'];
        }

        if (timestamp > now) {
            return [false, 'signature_is_in_the_future'];
        }

        const payload: EIP712Payload = this.generatePayload({timestamp, email, username}, 'Web3Register');

        try {
            const signer = await this.verify(payload, signature);
            return [true, toAcceptedAddressFormat(signer)];
        } catch (e) {
            return [false, 'signature_check_fail'];
        }
    }

}
