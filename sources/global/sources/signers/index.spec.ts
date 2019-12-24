import {use, expect}          from 'chai';
import * as chaiAsPromised    from 'chai-as-promised';
import { createWallet }       from '../wallet';
import { Web3LoginSigner }    from './Web3Login';
import { EIP712DomainType }   from '@ticket721/e712';
import { Web3RegisterSigner } from './Web3Register';
use(chaiAsPromised);

describe('Signers', function () {

    describe('Web3Login', function () {

        it('should sign and verify Web3Login payload', async function () {

            const wallet = await createWallet();
            const signer = new Web3LoginSigner(1);

            const payload = signer.generateAuthenticationProofPayload();
            expect(payload).to.deep.equal([
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
            expect(signed_payload).to.deep.equal([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ])

            const verification = await signer.verifyAuthenticationProof(signed_payload[1].hex, signed_payload[0], 30000);
            expect(verification).to.deep.equal([
                true,
                wallet.address
            ]);

        });

        it('should sign and fail verify Web3Login payload', async function () {

            const wallet = await createWallet();
            const signer = new Web3LoginSigner(1);

            const payload = signer.generateAuthenticationProofPayload();
            expect(payload).to.deep.equal([
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
            expect(signed_payload).to.deep.equal([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ]);

            const verification = await signer.verifyAuthenticationProof('0x' + signed_payload[1].hex.slice(6), signed_payload[0], 30000);
            expect(verification).to.deep.equal([
                false,
                'signature_check_fail'
            ]);

        });

        it('timed out', async function () {

            const wallet = await createWallet();
            const signer = new Web3LoginSigner(1);

            const payload = signer.generateAuthenticationProofPayload();
            expect(payload).to.deep.equal([
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
            expect(signed_payload).to.deep.equal([
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
            expect(verification).to.deep.equal([
                false,
                'signature_timed_out'
            ]);

        });

        it('signature is in the future', async function () {

            const wallet = await createWallet();
            const signer = new Web3LoginSigner(1);

            const timestamp = Date.now() + 1000000;
            const payload = signer.generatePayload({
                timestamp,
                address: wallet.address
            }, 'Web3Login');
            const signature = await signer.sign(wallet.privateKey, payload);

            const verification = await signer.verifyAuthenticationProof(signature.hex, timestamp, 30000);
            expect(verification).to.deep.equal([
                false,
                'signature_is_in_the_future'
            ]);

        });

    });

    describe('Web3Register', function () {

        it('should sign and verify Web3Register payload', async function () {

            const wallet = await createWallet();
            const signer = new Web3RegisterSigner(1);
            const email = 'test@test.com';
            const username = 'mortimr';

            const payload = signer.generateRegistrationProofPayload(email, username);
            expect(payload).to.deep.equal([
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
            expect(signed_payload).to.deep.equal([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ]);

            const verification = await signer.verifyRegistrationProof(signed_payload[1].hex, signed_payload[0], email, username, 30000);
            expect(verification).to.deep.equal([
                true,
                wallet.address
            ]);

        });

        it('should sign and fail verify Web3Register payload', async function () {

            const wallet = await createWallet();
            const signer = new Web3RegisterSigner(1);
            const email = 'test@test.com';
            const username = 'mortimr';

            const payload = signer.generateRegistrationProofPayload(email, username);
            expect(payload).to.deep.equal([
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
            expect(signed_payload).to.deep.equal([
                signed_payload[0],
                {
                    hex: signed_payload[1].hex,
                    r: signed_payload[1].r,
                    v: signed_payload[1].v,
                    s: signed_payload[1].s
                }
            ]);

            const verification = await signer.verifyRegistrationProof('0x' + signed_payload[1].hex.slice(6), signed_payload[0], email, username, 30000);
            expect(verification).to.deep.equal([
                false,
                'signature_check_fail'
            ]);

        });

        it('timed out', async function () {

            const wallet = await createWallet();
            const signer = new Web3RegisterSigner(1);
            const email = 'test@test.com';
            const username = 'mortimr';

            const payload = signer.generateRegistrationProofPayload(email, username);
            expect(payload).to.deep.equal([
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
            expect(signed_payload).to.deep.equal([
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
            expect(verification).to.deep.equal([
                false,
                'signature_timed_out'
            ]);

        });

        it('signature is in the future', async function () {

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
            expect(verification).to.deep.equal([
                false,
                'signature_is_in_the_future'
            ]);

        });

    });

});
