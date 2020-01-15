import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { instance, mock, when } from 'ts-mockito';
import {
    getModelToken,
    getRepositoryToken,
} from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { Test, TestingModule } from '@nestjs/testing';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';

class EntityModelMock {
    search(
        options: EsSearchOptionsStatic,
        callback?: (err: any, ret: any) => void,
    ): void {
        return;
    }

    _properties = null;
}

describe('ActionSets Service', function() {
    const context: {
        actionSetsService: ActionSetsService;
        actionSetsRepository: ActionSetsRepository;
        actionSetModel: EntityModelMock;
    } = {
        actionSetsService: null,
        actionSetsRepository: null,
        actionSetModel: null,
    };

    beforeEach(async function() {
        context.actionSetModel = mock(EntityModelMock);
        context.actionSetsRepository = mock(ActionSetsRepository);
        when(context.actionSetModel._properties).thenReturn({
            schema: {
                fields: {
                    id: {
                        type: 'uuid',
                    },
                },
            },
        });

        const ActionSetEntityModelProvider = {
            provide: getModelToken(ActionSetEntity),
            useValue: instance(context.actionSetModel),
        };

        const ActionSetsRepositoryProvider = {
            provide: getRepositoryToken(ActionSetsRepository),
            useValue: instance(context.actionSetsRepository),
        };

        const ActionSetsInputHandlersProvider = {
            provide: 'ACTIONSETS_INPUT_HANDLERS',
            useValue: [
                {
                    name: 'first',
                    handler: async (
                        actionSet: ActionSet,
                        progress: (n: number) => Promise<void>,
                    ): Promise<[ActionSet, boolean]> => {
                        return [actionSet, true];
                    },
                },
            ],
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                ActionSetEntityModelProvider,
                ActionSetsRepositoryProvider,
                ActionSetsInputHandlersProvider,
                ActionSetsService,
            ],
        }).compile();

        context.actionSetsService = app.get<ActionSetsService>(
            ActionSetsService,
        );
    });

    describe('getInputHandler', function() {
        it('should recover the input handler', async function() {
            expect(
                context.actionSetsService.getInputHandler('first'),
            ).toBeDefined();
        });

        it('should recover undefined if no handler exists', async function() {
            expect(
                context.actionSetsService.getInputHandler('second'),
            ).toBeUndefined();
        });
    });

    describe('setInputHandler', function() {
        it('should set net input handler', async function() {
            expect(
                context.actionSetsService.getInputHandler('second'),
            ).toBeUndefined();
            context.actionSetsService.setInputHandler(
                'second',
                async (...args: any[]): Promise<[any, any]> => {
                    return [1, 2];
                },
            );
            expect(
                context.actionSetsService.getInputHandler('second'),
            ).toBeDefined();
        });
    });
});
