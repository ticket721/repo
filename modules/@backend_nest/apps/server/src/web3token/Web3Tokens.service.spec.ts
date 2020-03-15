import { Test, TestingModule } from '@nestjs/testing';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { createWallet, toAcceptedAddressFormat } from '@common/global';
import { Web3TokensService } from '@app/server/web3token/Web3Tokens.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { Web3TokensRepository } from '@app/server/web3token/Web3Tokens.repository';
import { Web3TokenDto } from '@app/server/web3token/dto/Web3Token.dto';
import { Web3TokenEntity } from '@app/server/web3token/entities/Web3Token.entity';
import { types } from 'cassandra-driver';
import { ConfigService } from '@lib/common/config/Config.service';

class Web3TokenEntityModelMock {
    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

const context: {
    web3TokensService: Web3TokensService;
    web3TokenEntityModelMock: Web3TokenEntityModelMock;
    web3TokensRepositoryMock: Web3TokensRepository;
    configServiceMock: ConfigService;
} = {
    web3TokensService: null,
    web3TokenEntityModelMock: null,
    web3TokensRepositoryMock: null,
    configServiceMock: null,
};

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
            providers: [Web3TokenModelProvider, Web3TokensRepositoryProvider, ConfigServiceProvider, Web3TokensService],
        }).compile();

        context.web3TokensService = module.get<Web3TokensService>(Web3TokensService);
        context.web3TokenEntityModelMock = web3TokenEntityModelMock;
        context.web3TokensRepositoryMock = web3TokensRepositoryMock;
        context.configServiceMock = configServiceMock;
    });

    describe('register', function() {
        it('should register a web3 token', async function() {
            const web3TokensService = context.web3TokensService;
            const web3TokensRepositoryMock: Web3TokensRepository = context.web3TokensRepositoryMock;

            const timestamp = Date.now();
            const wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const token: Web3TokenDto = {
                timestamp: (types.Long as any).fromNumber(timestamp),
                address,
            };

            const generated_cb = async (): Promise<Web3TokenEntity> => {
                return {
                    timestamp,
                    address,
                };
            };

            const injected_cb = (): any => {
                return {
                    toPromise: generated_cb,
                };
            };

            when(web3TokensRepositoryMock.create(deepEqual(token))).thenReturn(token);
            when(web3TokensRepositoryMock.save(deepEqual(token), deepEqual({ ttl: parseInt('30') }))).thenCall(
                injected_cb,
            );

            const res = await web3TokensService.register({
                timestamp,
                address,
            });

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                timestamp,
                address,
            });

            verify(web3TokensRepositoryMock.save(deepEqual(token), deepEqual({ ttl: parseInt('30') }))).called();
        });

        it('unexpected error', async function() {
            const web3TokensService = context.web3TokensService;
            const web3TokensRepositoryMock: Web3TokensRepository = context.web3TokensRepositoryMock;

            const timestamp = Date.now();
            const wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const token: Web3TokenDto = {
                timestamp: (types.Long as any).fromNumber(timestamp),
                address,
            };

            const generated_cb = async (): Promise<Web3TokenEntity> => {
                return {
                    timestamp,
                    address,
                };
            };

            const injected_cb = (): any => {
                return {
                    toUnPromise: generated_cb,
                };
            };

            when(web3TokensRepositoryMock.create(deepEqual(token))).thenReturn(token);
            when(web3TokensRepositoryMock.save(deepEqual(token), deepEqual({ ttl: parseInt('30') }))).thenCall(
                injected_cb,
            );

            const res = await web3TokensService.register({
                timestamp,
                address,
            });

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(web3TokensRepositoryMock.save(deepEqual(token), deepEqual({ ttl: parseInt('30') }))).called();
        });
    });

    describe('check', function() {
        it('should check a web3 token', async function() {
            const web3TokensService = context.web3TokensService;
            const web3TokensRepositoryMock: Web3TokensRepository = context.web3TokensRepositoryMock;

            const timestamp = Date.now();
            const wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const token: Web3TokenDto = {
                timestamp: (types.Long as any).fromNumber(timestamp),
                address,
            };

            const generated_cb = async (): Promise<Web3TokenEntity> => {
                return {
                    timestamp,
                    address,
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
                address,
            });

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                timestamp,
                address,
            });

            verify(web3TokensRepositoryMock.findOne(deepEqual(token))).called();
        });

        it('unexpected error', async function() {
            const web3TokensService = context.web3TokensService;
            const web3TokensRepositoryMock: Web3TokensRepository = context.web3TokensRepositoryMock;

            const timestamp = Date.now();
            const wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const token: Web3TokenDto = {
                timestamp: (types.Long as any).fromNumber(timestamp),
                address,
            };

            const generated_cb = async (): Promise<Web3TokenEntity> => {
                return {
                    timestamp,
                    address,
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
                address,
            });

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(web3TokensRepositoryMock.findOne(deepEqual(token))).called();
        });
    });
});
