import { use, expect }       from 'chai';
import * as chaiAsPromised   from 'chai-as-promised';

use(chaiAsPromised);
import { AppService }        from './app.service';
import { ConfigService }     from './config/config.service';
import { APIInfos }          from './app.types';
import { mock, when, instance, verify }              from 'ts-mockito';


import * as pack            from '../package.json';
import * as branch          from 'git-branch';
import { INestApplication }    from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppService', () => {

    beforeEach(async function() {

        const configServiceMock: ConfigService = mock(ConfigService);

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock)
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [ConfigServiceProvider, AppService],
        }).compile();

        const appService: AppService = app.get<AppService>(AppService);

        console.log('replayed');

        this.configServiceMock = configServiceMock;
        this.appService = appService;

    });

    it('build and get info with NODE_ENV=development', async function() {

        const {appService, configServiceMock}: {appService: AppService, configServiceMock: ConfigService} = this as any;

        when(configServiceMock.get('NODE_ENV')).thenReturn('development');

        const res: APIInfos = appService.getAPIInfos();
        expect(res.name).to.equal('t721api');
        expect(res.version).to.equal(pack.version);
        expect(res.env).to.equal(`development@${branch.sync()}`);

        verify(configServiceMock.get('NODE_ENV')).called();

    });

    it('build and get info with NODE_ENV=development', async function() {

        const {appService, configServiceMock}: {appService: AppService, configServiceMock: ConfigService} = this as any;

        when(configServiceMock.get('NODE_ENV')).thenReturn('production');

        const res: APIInfos = appService.getAPIInfos();
        expect(res.name).to.equal('t721api');
        expect(res.version).to.equal(pack.version);
        expect(res.env).to.equal(`production@${branch.sync()}`);

        verify(configServiceMock.get('NODE_ENV')).called();

    });

});
