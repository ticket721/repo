import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { instance, mock, when } from 'ts-mockito';
import { getModelToken, getRepositoryToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { ConfigService } from '@lib/common/config/Config.service';
import { ModuleRef } from '@nestjs/core';
import { RightsService } from '@lib/common/rights/Rights.service';

class EntityModelMock {
    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }

    _properties = null;
}

describe('ActionSets Service', function() {
    const context: {
        actionSetsService: ActionSetsService;
        actionSetsRepository: ActionSetsRepository;
        actionSetModel: EntityModelMock;
        configServiceMock: ConfigService;
        moduleRefMock: ModuleRef;
        rightsServiceMock: RightsService;
    } = {
        actionSetsService: null,
        actionSetsRepository: null,
        actionSetModel: null,
        configServiceMock: null,
        moduleRefMock: null,
        rightsServiceMock: null,
    };

    beforeEach(async function() {
        context.actionSetModel = mock(EntityModelMock);
        context.actionSetsRepository = mock(ActionSetsRepository);
        context.configServiceMock = mock(ConfigService);
        when(context.actionSetModel._properties).thenReturn({
            schema: {
                fields: {
                    id: {
                        type: 'uuid',
                    },
                },
            },
        });
        context.moduleRefMock = mock(ModuleRef);
        context.rightsServiceMock = mock(RightsService);

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(context.configServiceMock),
        };

        const ActionSetEntityModelProvider = {
            provide: getModelToken(ActionSetEntity),
            useValue: instance(context.actionSetModel),
        };

        const ActionSetsRepositoryProvider = {
            provide: getRepositoryToken(ActionSetsRepository),
            useValue: instance(context.actionSetsRepository),
        };

        const ModuleRefProvider = {
            provide: ModuleRef,
            useValue: instance(context.moduleRefMock),
        };

        const RightsServiceProvider = {
            provide: RightsService,
            useValue: instance(context.rightsServiceMock),
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                ActionSetEntityModelProvider,
                ActionSetsRepositoryProvider,
                ConfigServiceProvider,
                ModuleRefProvider,
                RightsServiceProvider,
                ActionSetsService,
            ],
        }).compile();

        context.actionSetsService = app.get<ActionSetsService>(ActionSetsService);
    });

    describe('getInputHandler', function() {
        it('should recover the input handler', async function() {
            expect(context.actionSetsService.getInputHandler('first')).toBeUndefined();
            context.actionSetsService.setInputHandler('first', {} as any);
            expect(context.actionSetsService.getInputHandler('first')).toBeDefined();
        });

        it('should recover undefined if no handler exists', async function() {
            expect(context.actionSetsService.getInputHandler('first')).toBeUndefined();
        });
    });
});
