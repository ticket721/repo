import { createWallet }       from '../wallet';
import { Web3LoginSigner }    from './Web3Login';
import { EIP712DomainType }   from '@ticket721/e712';
import { Web3RegisterSigner } from './Web3Register';
import { RefractMtx }         from './RefractMtx';

describe('Signers', function () {

    describe('Web3Login', function () {

        test('should sign and verify Web3Login payload', async function () {

            const wallet = await createWallet();
            const signer = new Web3LoginSigner(1);

            const payload = signer.generateAuthenticationProofPayload();
            expect(payload).toEqual([
                payload[0],
                {
                    domain: {
                        name: 'Ticket721 Web3 Login',
                        version: '0',
                        chainId: 1,
                        verifyingContract: '0x0000000000000000000000000000000000000000'
                    },
                    primaryType: 'Web3Login',
                    types: {
                        Web3Login: [
                            {
                                type: 'uint256',
                                name: 'timestamp'
                            }
                        ],
                        EIP712Domain: EIP712DomainType
                    },
                    message: {
                        timestamp: payload[0]
                    }
                }
            ]);

            const signed_payload = await signer.generateAuthenticationProof(wallet.privateKey);
            expect(signed_payload).toEqual([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ]);

            const verification = await signer.verifyAuthenticationProof(signed_payload[1].hex, signed_payload[0], 30000);
            expect(verification).toEqual([
                true,
                wallet.address
            ]);

        });

        test('should sign and fail verify Web3Login payload', async function () {

            const wallet = await createWallet();
            const signer = new Web3LoginSigner(1);

            const payload = signer.generateAuthenticationProofPayload();
            expect(payload).toEqual([
                payload[0],
                {
                    domain: {
                        name: 'Ticket721 Web3 Login',
                        version: '0',
                        chainId: 1,
                        verifyingContract: '0x0000000000000000000000000000000000000000'
                    },
                    primaryType: 'Web3Login',
                    types: {
                        Web3Login: [
                            {
                                type: 'uint256',
                                name: 'timestamp'
                            }
                        ],
                        EIP712Domain: EIP712DomainType
                    },
                    message: {
                        timestamp: payload[0]
                    }
                }
            ]);

            const signed_payload = await signer.generateAuthenticationProof(wallet.privateKey);
            expect(signed_payload).toEqual([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ]);

            const verification = await signer.verifyAuthenticationProof('0x' + signed_payload[1].hex.slice(6), signed_payload[0], 30000);
            expect(verification).toEqual([
                false,
                'signature_check_fail'
            ]);

        });

        test('timed out', async function () {

            const wallet = await createWallet();
            const signer = new Web3LoginSigner(1);

            const payload = signer.generateAuthenticationProofPayload();
            expect(payload).toEqual([
                payload[0],
                {
                    domain: {
                        name: 'Ticket721 Web3 Login',
                        version: '0',
                        chainId: 1,
                        verifyingContract: '0x0000000000000000000000000000000000000000'
                    },
                    primaryType: 'Web3Login',
                    types: {
                        Web3Login: [
                            {
                                type: 'uint256',
                                name: 'timestamp'
                            }
                        ],
                        EIP712Domain: EIP712DomainType
                    },
                    message: {
                        timestamp: payload[0]
                    }
                }
            ]);

            const signed_payload = await signer.generateAuthenticationProof(wallet.privateKey);
            expect(signed_payload).toEqual([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ])

            await new Promise((ok, ko) => setTimeout(ok, 100));

            const verification = await signer.verifyAuthenticationProof(signed_payload[1].hex, signed_payload[0], 0);
            expect(verification).toEqual([
                false,
                'signature_timed_out'
            ]);

        });

        test('signature is in the future', async function () {

            const wallet = await createWallet();
            const signer = new Web3LoginSigner(1);

            const timestamp = Date.now() + 1000000;
            const payload = signer.generatePayload({
                timestamp,
                address: wallet.address
            }, 'Web3Login');
            const signature = await signer.sign(wallet.privateKey, payload);

            const verification = await signer.verifyAuthenticationProof(signature.hex, timestamp, 30000);
            expect(verification).toEqual([
                false,
                'signature_is_in_the_future'
            ]);

        });

    });

    describe('Web3Register', function () {

        test('should sign and verify Web3Register payload', async function () {

            const wallet = await createWallet();
            const signer = new Web3RegisterSigner(1);
            const email = 'test@test.com';
            const username = 'mortimr';

            const payload = signer.generateRegistrationProofPayload(email, username);
            expect(payload).toEqual([
                payload[0],
                {
                    domain: {
                        name: 'Ticket721 Web3 Register',
                        version: '0',
                        chainId: 1,
                        verifyingContract: '0x0000000000000000000000000000000000000000'
                    },
                    primaryType: 'Web3Register',
                    types: {
                        Web3Register: [
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
                        ],
                        EIP712Domain: EIP712DomainType
                    },
                    message: {
                        email,
                        timestamp: payload[0],
                        username
                    }
                }
            ]);

            const signed_payload = await signer.generateRegistrationProof(email, username, wallet.privateKey);
            expect(signed_payload).toEqual([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ]);

            const verification = await signer.verifyRegistrationProof(signed_payload[1].hex, signed_payload[0], email, username, 30000);
            expect(verification).toEqual([
                true,
                wallet.address
            ]);

        });

        test('should sign and fail verify Web3Register payload', async function () {

            const wallet = await createWallet();
            const signer = new Web3RegisterSigner(1);
            const email = 'test@test.com';
            const username = 'mortimr';

            const payload = signer.generateRegistrationProofPayload(email, username);
            expect(payload).toEqual([
                payload[0],
                {
                    domain: {
                        name: 'Ticket721 Web3 Register',
                        version: '0',
                        chainId: 1,
                        verifyingContract: '0x0000000000000000000000000000000000000000'
                    },
                    primaryType: 'Web3Register',
                    types: {
                        Web3Register: [
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
                        ],
                        EIP712Domain: EIP712DomainType
                    },
                    message: {
                        email,
                        timestamp: payload[0],
                        username
                    }
                }
            ]);

            const signed_payload = await signer.generateRegistrationProof(email, username, wallet.privateKey);
            expect(signed_payload).toEqual([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ]);

            const verification = await signer.verifyRegistrationProof('0x' + signed_payload[1].hex.slice(6), signed_payload[0], email, username, 30000);
            expect(verification).toEqual([
                false,
                'signature_check_fail'
            ]);

        });

        test('timed out', async function () {

            const wallet = await createWallet();
            const signer = new Web3RegisterSigner(1);
            const email = 'test@test.com';
            const username = 'mortimr';

            const payload = signer.generateRegistrationProofPayload(email, username);
            expect(payload).toEqual([
                payload[0],
                {
                    domain: {
                        name: 'Ticket721 Web3 Register',
                        version: '0',
                        chainId: 1,
                        verifyingContract: '0x0000000000000000000000000000000000000000'
                    },
                    primaryType: 'Web3Register',
                    types: {
                        Web3Register: [
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
                        ],
                        EIP712Domain: EIP712DomainType
                    },
                    message: {
                        email,
                        username,
                        timestamp: payload[0]
                    }
                }
            ]);

            const signed_payload = await signer.generateRegistrationProof(email, username, wallet.privateKey);
            expect(signed_payload).toEqual([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ]);

            await new Promise((ok, ko) => setTimeout(ok, 100));

            const verification = await signer.verifyRegistrationProof(signed_payload[1].hex, signed_payload[0], email, username, 0);
            expect(verification).toEqual([
                false,
                'signature_timed_out'
            ]);

        });

        test('signature is in the future', async function () {

            const wallet = await createWallet();
            const signer = new Web3RegisterSigner(1);

            const email = 'test@test.com';
            const username = 'mortimr';
            const timestamp = Date.now() + 1000000;
            const payload = signer.generatePayload({
                timestamp,
                address: wallet.address,
                username,
                email
            }, 'Web3Register');
            const signature = await signer.sign(wallet.privateKey, payload);

            const verification = await signer.verifyRegistrationProof(signature.hex, timestamp, email, username, 30000);
            expect(verification).toEqual([
                false,
                'signature_is_in_the_future'
            ]);

        });

    });

    describe('RefractMtx', function() {

        it('builds instance and generated payload', async function() {

            const refractMtxSigner = new RefractMtx(2702, 'Refract Wallet', '0', '0x0000000000000000000000000000000000000000');

            const payload = refractMtxSigner.generatePayload({
                nonce: 0,
                parameters: [{
                    from: '0x0000000000000000000000000000000000000000',
                    to: '0x0000000000000000000000000000000000000000',
                    relayer: '0x0000000000000000000000000000000000000000',
                    value: 0,
                    data: '0xabcdef'
                }]
            }, 'MetaTransaction');

        })

    });

});
