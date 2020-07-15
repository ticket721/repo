import { RocksideService }                         from '@lib/common/rockside/Rockside.service';
import { RocksideApi }                                  from '@rocksideio/rockside-wallet-sdk/lib/api';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test }                                         from '@nestjs/testing';
import { keccak256FromBuffer }                     from '@common/global';
import { NestError }                               from '@lib/common/utils/NestError';
import { ConfigService }                           from '@lib/common/config/Config.service';

describe('Rockside Service', function() {
    const context: {
        rocksideService: RocksideService;
        rocksideApiMock: RocksideApi;
        configServiceMock: ConfigService;
    } = {
        rocksideService: null,
        rocksideApiMock: null,
        configServiceMock: null,
    };

    beforeEach(async function() {
        context.rocksideApiMock = mock(RocksideApi);
        context.configServiceMock = mock(ConfigService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: RocksideApi,
                    useValue: instance(context.rocksideApiMock),
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock)
                },
                RocksideService,
            ],
        }).compile();

        context.rocksideService = app.get<RocksideService>(RocksideService);
    });

    describe('createEOA', function() {
        it('should properly create an EOA', async function() {
            // DECLARE
            const returnedAddress = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';

            // MOCK
            when(context.rocksideApiMock.createEOA()).thenResolve({
                address: returnedAddress,
            });

            // TRIGGER
            const res = await context.rocksideService.createEOA();

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                address: returnedAddress,
            });

            // CHECK CALLS
            verify(context.rocksideApiMock.createEOA()).once();
        });

        it('should fail on api error', async function() {
            // DECLARE

            // MOCK
            when(context.rocksideApiMock.createEOA()).thenThrow(new NestError('an error occured'));

            // TRIGGER
            const res = await context.rocksideService.createEOA();

            // CHECK RETURNs
            expect(res.error).toEqual('an error occured');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.rocksideApiMock.createEOA()).once();
        });
    });

    describe('getSigner', function() {
        it('should properly create an EOA', async function() {
            // DECLARE
            const address = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const encodedPayload = '0xabcd';
            const hashedPayload = keccak256FromBuffer(Buffer.from(encodedPayload.slice(2), 'hex'));
            const signature =
                '0x4cf19c7e25f7ba49755ea19baf4b3e8df3694e472c591f24d2fa8b029cdb2379232bce3f0709b12ff83d8104b7251aefa882661495b17fbb453605dd0b5180541c';

            // MOCK
            when(context.rocksideApiMock.signMessageWithEOA(address, hashedPayload)).thenResolve({
                signed_message: signature,
            });

            // TRIGGER
            const signer = await context.rocksideService.getSigner(address);
            const res = await signer(encodedPayload);

            // CHECK RETURNs
            expect(res).toEqual({
                hex:
                    '0x4cf19c7e25f7ba49755ea19baf4b3e8df3694e472c591f24d2fa8b029cdb2379232bce3f0709b12ff83d8104b7251aefa882661495b17fbb453605dd0b5180541c',
                r: '0x4cf19c7e25f7ba49755ea19baf4b3e8df3694e472c591f24d2fa8b029cdb2379',
                s: '0x232bce3f0709b12ff83d8104b7251aefa882661495b17fbb453605dd0b518054',
                v: 28,
            });

            // CHECK CALLS
            verify(context.rocksideApiMock.signMessageWithEOA(address, hashedPayload)).once();
        });

        it('should fail on api error', async function() {
            // DECLARE
            const address = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const encodedPayload = '0xabcd';
            const hashedPayload = keccak256FromBuffer(Buffer.from(encodedPayload.slice(2), 'hex'));

            // MOCK
            when(context.rocksideApiMock.signMessageWithEOA(address, hashedPayload)).thenThrow(
                new NestError('an error occured'),
            );

            // TRIGGER
            const signer = await context.rocksideService.getSigner(address);
            await expect(signer(encodedPayload)).rejects.toMatchObject(new NestError('an error occured'));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.rocksideApiMock.signMessageWithEOA(address, hashedPayload)).once();
        });
    });

    describe('createIdentity', function() {
        it('should should properly create an identity', async function() {
            // DECLARE
            const address = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const transactionHash = '0x3fd04876718d6e5b376f63b13eaf239171f3de844508115ae3e91505658cfde7';
            const forwarder = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const account = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const spied = spy(context.rocksideService);

            // MOCK
            when(context.configServiceMock.get('ROCKSIDE_FORWARDER_ADDRESS')).thenReturn(forwarder);
            when(spied.createEOA()).thenResolve({
                error: null,
                response: {
                    address: account
                }
            });
            when(context.rocksideApiMock.createIdentity(forwarder, account)).thenResolve({
                transactionHash,
                address,
            });

            // TRIGGER
            const res = await context.rocksideService.createIdentity();

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                transactionHash,
                address,
            });

            // CHECK CALLS
            verify(context.configServiceMock.get('ROCKSIDE_FORWARDER_ADDRESS')).once();
            verify(spied.createEOA()).once();
            verify(context.rocksideApiMock.createIdentity(forwarder, account)).once();
        });

        it('should fail on api fail', async function() {
            const forwarder = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const account = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const spied = spy(context.rocksideService);
            // DECLARE

            // MOCK
            when(context.configServiceMock.get('ROCKSIDE_FORWARDER_ADDRESS')).thenReturn(forwarder);
            when(spied.createEOA()).thenResolve({
                error: null,
                response: {
                    address: account
                }
            });
            when(context.rocksideApiMock.createIdentity(forwarder, account)).thenThrow(new NestError('an error occured'));

            // TRIGGER
            const res = await context.rocksideService.createIdentity();

            // CHECK RETURNs
            expect(res.error).toEqual('an error occured');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.configServiceMock.get('ROCKSIDE_FORWARDER_ADDRESS')).once();
            verify(spied.createEOA()).once();
            verify(context.rocksideApiMock.createIdentity(forwarder, account)).once();
        });

        it('should fail on eoa creation fail', async function() {
            const forwarder = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const account = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const spied = spy(context.rocksideService);
            // DECLARE

            // MOCK
            when(spied.createEOA()).thenResolve({
                error: 'eoa_creation_failure',
                response: null
            });

            // TRIGGER
            const res = await context.rocksideService.createIdentity();

            // CHECK RETURNs
            expect(res.error).toEqual('eoa_creation_error');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(spied.createEOA()).once();
        });

    });

    describe('sendTransaction', function() {
        it('should properly send transaction', async function() {
            // DECLARE
            const to_address = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const from_address = '0x7485ac6d8534691993348D51ab0F131a19FfF763';
            const data = '0xabcd';
            const value = '0';
            const transactionHash = '0x3fd04876718d6e5b376f63b13eaf239171f3de844508115ae3e91505658cfde7';
            const trackingId = 'trALKSJHLKJFHSLKDJHFLKSF';

            // MOCK
            when(
                context.rocksideApiMock.sendTransaction(
                    deepEqual({
                        to: to_address,
                        from: from_address,
                        data,
                        value,
                    }),
                ),
            ).thenResolve({
                transaction_hash: transactionHash,
                tracking_id: trackingId,
            });

            // TRIGGER
            const res = await context.rocksideService.sendTransaction({
                to: to_address,
                from: from_address,
                data,
                value,
            });

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual(transactionHash);

            // CHECK CALLS
            verify(
                context.rocksideApiMock.sendTransaction(
                    deepEqual({
                        to: to_address,
                        from: from_address,
                        data,
                        value,
                    }),
                ),
            ).once();
        });

        it('should fail on api fail', async function() {
            // DECLARE
            const to_address = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const from_address = '0x7485ac6d8534691993348D51ab0F131a19FfF763';
            const data = '0xabcd';
            const value = '0';

            // MOCK
            when(
                context.rocksideApiMock.sendTransaction(
                    deepEqual({
                        to: to_address,
                        from: from_address,
                        data,
                        value,
                    }),
                ),
            ).thenThrow(new NestError('an error occured'));

            // TRIGGER
            const res = await context.rocksideService.sendTransaction({
                to: to_address,
                from: from_address,
                data,
                value,
            });

            // CHECK RETURNs
            expect(res.error).toEqual('an error occured');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.rocksideApiMock.sendTransaction(
                    deepEqual({
                        to: to_address,
                        from: from_address,
                        data,
                        value,
                    }),
                ),
            ).once();
        });
    });
});
