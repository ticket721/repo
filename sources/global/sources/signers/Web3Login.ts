import { EIP712Signer, EIP712Signature, EIP712Payload } from '@ticket721/e712';
import { toAcceptedAddressFormat }                      from '../address';

const Web3Login = [
    {
        type: 'uint256',
        name: 'timestamp'
    }
];

export class Web3LoginSigner extends EIP712Signer {

    constructor(chain_id: number) {
        super(
            {
                name: 'Ticket721 Web3 Login',
                version: '0',
                chainId: chain_id,
                verifyingContract: '0x0000000000000000000000000000000000000000'
            },
            ['Web3Login', Web3Login]
        )
    }

    public generateAuthenticationProofPayload(): [number, EIP712Payload] {

        const timestamp = Date.now();
        return [timestamp, this.generatePayload({
            timestamp
        }, 'Web3Login')];

    }

    public async generateAuthenticationProof(privateKey: string): Promise<[number, EIP712Signature]> {
        const timestamp = Date.now();
        const payload = this.generatePayload({
            timestamp
        }, 'Web3Login');

        const sig: EIP712Signature = await this.sign(privateKey, payload);

        return [timestamp, sig];
    }

    public async verifyAuthenticationProof(signature: string, timestamp: number, timeout: number): Promise<[boolean, string]> {

        const now = Date.now();
        if (now - timeout > timestamp) {
            return [false, 'signature_timed_out'];
        }

        if (timestamp > now) {
            return [false, 'signature_is_in_the_future'];
        }

        const payload: EIP712Payload = this.generatePayload({timestamp}, 'Web3Login');

        try {
            const signer = await this.verify(payload, signature);
            return [true, toAcceptedAddressFormat(signer)];
        } catch (e) {
            return [false, 'signature_check_fail'];
        }
    }

}
