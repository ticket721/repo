import { ContractsController } from '@app/server/controllers/contracts/Contracts.controller';
import {
    ContractArtifact,
    ContractsService,
} from '@lib/common/contracts/Contracts.service';
import { instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';

describe('Contracts Controller', function() {
    const context: {
        contractsController: ContractsController;
        contractsServiceMock: ContractsService;
    } = {
        contractsController: null,
        contractsServiceMock: null,
    };

    beforeEach(async function() {
        context.contractsServiceMock = mock(ContractsService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ContractsService,
                    useValue: instance(context.contractsServiceMock),
                },
            ],
            controllers: [ContractsController],
        }).compile();

        context.contractsController = app.get<ContractsController>(
            ContractsController,
        );
    });

    describe('getContractArtifacts', function() {
        it('should recover contract artifacts', async function() {
            when(
                context.contractsServiceMock.getContractArtifacts(),
            ).thenResolve({
                ContractName: ({
                    contract: 'data',
                } as any) as ContractArtifact,
            });

            const res = await context.contractsController.getContractArtifacts();

            expect(res.contracts).toEqual({
                ContractName: ({
                    contract: 'data',
                } as any) as ContractArtifact,
            });

            verify(
                context.contractsServiceMock.getContractArtifacts(),
            ).called();
        });
    });
});
