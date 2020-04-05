import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { MetaMarketplaceV0Service } from '@lib/common/contracts/metamarketplace/MetaMarketplace.V0.service';
import { TicketforgeService } from '@lib/common/contracts/Ticketforge.service';
import { instance, mock } from 'ts-mockito';
import { Test } from '@nestjs/testing';

describe('Ticketforge Service', function() {
    const context: {
        ticketForgeService: TicketforgeService;
        contractsServiceMock: ContractsService;
        web3ServiceMock: Web3Service;
        shutdownServiceMock: ShutdownService;
        t721controllerV0Mock: T721ControllerV0Service;
        metaMarketplaceV0Mock: MetaMarketplaceV0Service;
    } = {
        ticketForgeService: null,
        contractsServiceMock: null,
        web3ServiceMock: null,
        shutdownServiceMock: null,
        t721controllerV0Mock: null,
        metaMarketplaceV0Mock: null,
    };

    beforeEach(async function() {
        context.contractsServiceMock = mock(ContractsService);
        context.web3ServiceMock = mock(Web3Service);
        context.shutdownServiceMock = mock(ShutdownService);
        context.t721controllerV0Mock = mock(T721ControllerV0Service);
        context.metaMarketplaceV0Mock = mock(MetaMarketplaceV0Service);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: ContractsService,
                    useValue: instance(context.contractsServiceMock),
                },
                {
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: T721ControllerV0Service,
                    useValue: instance(context.t721controllerV0Mock),
                },
                {
                    provide: MetaMarketplaceV0Service,
                    useValue: instance(context.metaMarketplaceV0Mock),
                },
                TicketforgeService,
            ],
        }).compile();

        context.ticketForgeService = app.get<TicketforgeService>(TicketforgeService);
    });

    describe('registerScopeBindings & getScopeContracts', function() {
        it('should recover nothing', async function() {
            const bindings = context.ticketForgeService.getScopeContracts('test');

            expect(bindings).toEqual(undefined);
        });

        it('should recover bindings', async function() {
            const bindings = context.ticketForgeService.getScopeContracts('ticket721_0');

            expect(bindings).toEqual({
                mm: instance(context.metaMarketplaceV0Mock),
                t721c: instance(context.t721controllerV0Mock),
            });
        });
    });
});
