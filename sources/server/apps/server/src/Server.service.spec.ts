import { use, expect }                  from 'chai';
import * as chaiAsPromised              from 'chai-as-promised';
import { mock, when, instance, verify } from 'ts-mockito';
import * as pack                        from '../../../package.json';
import * as branch                      from 'git-branch';
import { Test, TestingModule }          from '@nestjs/testing';
import { ServerService }                from './Server.service';
import { APIInfos }                     from './Server.types';
import { ConfigService }                from '@lib/common/config/Config.service';
import { WinstonLoggerService }         from '@lib/common/logger/WinstonLogger.service';

use(chaiAsPromised);

describe('ServerService', () => {

    beforeEach(async function() {

        const configServiceMock: ConfigService = mock(ConfigService);

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock),
        };

        const WinstonLoggerServiceProvider = {
            provide: WinstonLoggerService,
            useValue: new WinstonLoggerService('server')
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [ConfigServiceProvider, ServerService, WinstonLoggerServiceProvider],
        }).compile();

        const appService: ServerService = app.get<ServerService>(ServerService);

        this.configServiceMock = configServiceMock;
        this.appService = appService;

    });

    it('build and get info with NODE_ENV=development', async function() {

        const { appService, configServiceMock }: { appService: ServerService, configServiceMock: ConfigService } = this as any;

        when(configServiceMock.get('NODE_ENV')).thenReturn('development');

        const res: APIInfos = appService.getAPIInfos();
        expect(res.name).to.equal('t721api');
        expect(res.version).to.equal(pack.version);
        expect(res.env).to.equal(`development@${branch.sync()}`);

        verify(configServiceMock.get('NODE_ENV')).called();

    });

    it('build and get info with NODE_ENV=production', async function() {

        const { appService, configServiceMock }: { appService: ServerService, configServiceMock: ConfigService } = this as any;

        when(configServiceMock.get('NODE_ENV')).thenReturn('production');

        const res: APIInfos = appService.getAPIInfos();
        expect(res.name).to.equal('t721api');
        expect(res.version).to.equal(pack.version);
        expect(res.env).to.equal(`production@${branch.sync()}`);

        verify(configServiceMock.get('NODE_ENV')).called();

    });

});
