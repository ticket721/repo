import { use, expect }                                        from 'chai';
import * as chaiAsPromised                                    from 'chai-as-promised';
import { Test, TestingModule }                                from '@nestjs/testing';
import { anyString, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import {
    createWallet,
    encryptWallet,
    keccak256, toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
    Web3RegisterSigner,
    Web3LoginSigner
}                                from '@ticket721sources/global';
import { Web3TokensService }     from '@app/server/web3token/Web3Tokens.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { Web3TokensRepository }  from '@app/server/web3token/Web3Tokens.repository';
import { Web3TokenDto }          from '@app/server/web3token/dto/Web3Token.dto';
import { Web3TokenEntity }       from '@app/server/web3token/entities/Web3Token.entity';
import { types }                 from 'cassandra-driver';
import { ConfigService }         from '@lib/common/config/Config.service';

use(chaiAsPromised);

class Web3TokenEntityModelMock {
    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('Web3Tokens Service', function() {

    beforeEach(async function() {

        const web3TokenEntityModelMock: Web3TokenEntityModelMock = mock(Web3TokenEntityModelMock);
        const web3TokensRepositoryMock: Web3TokensRepository = mock(Web3TokensRepository);
        const configServiceMock: ConfigService = mock(ConfigService);

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock),
        };

        when(configServiceMock.get('AUTH_SIGNATURE_TIMEOUT')).thenReturn('30');


        const Web3TokenModelProvider = {
            provide: 'Web3TokenEntityModel',
            useValue: instance(web3TokenEntityModelMock),
        };

        const Web3TokensRepositoryProvider = {
            provide: Web3TokensRepository,
            useValue: instance(web3TokensRepositoryMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Web3TokenModelProvider,
                Web3TokensRepositoryProvider,
                ConfigServiceProvider,
                Web3TokensService,
            ],
        }).compile();

        this.web3TokensService = module.get<Web3TokensService>(Web3TokensService);
        this.web3TokenEntityModelMock = web3TokenEntityModelMock;
        this.web3TokensRepositoryMock = web3TokensRepositoryMock;
        this.configServiceMock = configServiceMock;

    });

    describe('register', function () {

        it('should register a web3 token', async function () {

            const web3TokensService = this.web3TokensService;
            const web3TokenEntityModelMock = this.web3TokenEntityModelMock;
            const web3TokensRepositoryMock: Web3TokensRepository = this.web3TokensRepositoryMock;

            const timestamp = Date.now();
            const wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const token: Web3TokenDto = {
                timestamp: (types.Long as any).fromNumber(timestamp),
                address
            };

            const generated_cb = async (): Promise<Web3TokenEntity> => {
                return {
                    timestamp,
                    address
                };
            };

            const injected_cb = (): any => {
                return {
                    toPromise: generated_cb,
                };
            };

            when(web3TokensRepositoryMock.create(deepEqual(token))).thenReturn(token);
            when(web3TokensRepositoryMock.save(deepEqual(token), deepEqual({ttl: parseInt('30')}))).thenCall(injected_cb);

            const res = await web3TokensService.register({
                timestamp,
                address
            });

            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal({
                timestamp,
                address
            });

            verify(web3TokensRepositoryMock.save(deepEqual(token), deepEqual({ttl: parseInt('30')}))).called();

        });

        it('unexpected error', async function () {

            const web3TokensService = this.web3TokensService;
            const web3TokenEntityModelMock = this.web3TokenEntityModelMock;
            const web3TokensRepositoryMock: Web3TokensRepository = this.web3TokensRepositoryMock;

            const timestamp = Date.now();
            const wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const token: Web3TokenDto = {
                timestamp: (types.Long as any).fromNumber(timestamp),
                address
            };

            const generated_cb = async (): Promise<Web3TokenEntity> => {
                return {
                    timestamp,
                    address
                };
            };

            const injected_cb = (): any => {
                return {
                    toUnPromise: generated_cb,
                };
            };

            when(web3TokensRepositoryMock.create(deepEqual(token))).thenReturn(token);
            when(web3TokensRepositoryMock.save(deepEqual(token), deepEqual({ttl: parseInt('30')}))).thenCall(injected_cb);

            const res = await web3TokensService.register({
                timestamp,
                address
            });

            expect(res.error).to.equal('unexpected_error');
            expect(res.response).to.equal(null);

            verify(web3TokensRepositoryMock.save(deepEqual(token), deepEqual({ttl: parseInt('30')}))).called();

        });

    });

    describe('check', function () {

        it('should check a web3 token', async function () {

            const web3TokensService = this.web3TokensService;
            const web3TokenEntityModelMock = this.web3TokenEntityModelMock;
            const web3TokensRepositoryMock: Web3TokensRepository = this.web3TokensRepositoryMock;

            const timestamp = Date.now();
            const wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const token: Web3TokenDto = {
                timestamp: (types.Long as any).fromNumber(timestamp),
                address
            };

            const generated_cb = async (): Promise<Web3TokenEntity> => {
                return {
                    timestamp,
                    address
                };
            };

            const injected_cb = (): any => {
                return {
                    toPromise: generated_cb,
                };
            };

            when(web3TokensRepositoryMock.findOne(deepEqual(token))).thenCall(injected_cb);

            const res = await web3TokensService.check({
                timestamp,
                address
            });

            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal({
                timestamp,
                address
            });

            verify(web3TokensRepositoryMock.findOne(deepEqual(token))).called();

        });

        it('unexpected error', async function () {

            const web3TokensService = this.web3TokensService;
            const web3TokenEntityModelMock = this.web3TokenEntityModelMock;
            const web3TokensRepositoryMock: Web3TokensRepository = this.web3TokensRepositoryMock;

            const timestamp = Date.now();
            const wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const token: Web3TokenDto = {
                timestamp: (types.Long as any).fromNumber(timestamp),
                address
            };

            const generated_cb = async (): Promise<Web3TokenEntity> => {
                return {
                    timestamp,
                    address
                };
            };

            const injected_cb = (): any => {
                return {
                    toUnPromise: generated_cb,
                };
            };

            when(web3TokensRepositoryMock.findOne(deepEqual(token))).thenCall(injected_cb);

            const res = await web3TokensService.check({
                timestamp,
                address
            });

            expect(res.error).to.equal('unexpected_error');
            expect(res.response).to.equal(null);

            verify(web3TokensRepositoryMock.findOne(deepEqual(token))).called();

        });


    });

});
