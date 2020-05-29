import { Appender, EVMEventControllerBase } from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { decimalToHex, encode, toAcceptedAddressFormat, toB32 } from '@common/global';
import { GroupService } from '@lib/common/group/Group.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { NestError } from '@lib/common/utils/NestError';

/**
 * EVM Antenna to intercept NewCategory events emitted by the T721Controller
 */
export class MintT721ControllerEVMAntenna extends EVMEventControllerBase {
    /**
     * Dependency Injection
     *
     * @param t721controllerService
     * @param scheduler
     * @param globalConfigService
     * @param shutdownService
     * @param outrospectionService
     * @param evmEventSetsService
     * @param ticketsService
     * @param categoriesService
     * @param groupService
     * @param authorizationsService;w
     * @param loggerService
     */
    constructor(
        t721controllerService: T721ControllerV0Service,
        @InjectSchedule() scheduler: Schedule,
        globalConfigService: GlobalConfigService,
        shutdownService: ShutdownService,
        outrospectionService: OutrospectionService,
        evmEventSetsService: EVMEventSetsService,
        private readonly ticketsService: TicketsService,
        private readonly categoriesService: CategoriesService,
        private readonly groupService: GroupService,
        private readonly authorizationsService: AuthorizationsService,
        private readonly loggerService: WinstonLoggerService,
    ) {
        super(
            t721controllerService,
            scheduler,
            globalConfigService,
            shutdownService,
            outrospectionService,
            evmEventSetsService,
            'Mint',
        );
    }

    /**
     * Internal utility to perform all checks upon a ticket minting event is caught
     *
     * @param event
     * @param append
     * @param ticketEntity
     */
    private async existingTicketHandler(
        event: EVMProcessableEvent,
        append: Appender,
        ticketEntity: TicketEntity,
    ): Promise<void> {
        const returnValues = JSON.parse(event.return_values);

        if (ticketEntity.group_id !== returnValues.group) {
            throw new NestError(
                `Invalid group id received from event: ticket got ${ticketEntity.group_id} and event gives ${returnValues.group}`,
            );
        }

        const categoryEntityRes = await this.categoriesService.search({
            id: ticketEntity.category,
        });

        if (categoryEntityRes.error || categoryEntityRes.response.length === 0) {
            throw new NestError(
                `Cannot find category linked to existing ticket: ${categoryEntityRes.error || 'category not found'}`,
            );
        }

        const category: CategoryEntity = categoryEntityRes.response[0];

        if (toB32(category.category_name).toLowerCase() !== returnValues.category.toLowerCase()) {
            throw new NestError(
                `Invalid category name received from event: ticket got ${toB32(
                    category.category_name,
                ).toLowerCase()} and event gives ${returnValues.category.toLowerCase()}`,
            );
        }
        if (toAcceptedAddressFormat(ticketEntity.owner) !== toAcceptedAddressFormat(returnValues.owner)) {
            throw new NestError(
                `Invalid owner address received from event: ticket got ${ticketEntity.owner} and event gives ${returnValues.owner}`,
            );
        }

        const controllerFieldsRes = await this.groupService.getCategoryControllerFields<[string]>(category, [
            'address',
        ]);

        if (controllerFieldsRes.error) {
            throw new NestError(`Unable to retrieve group controller`);
        }

        const [granter]: [string] = controllerFieldsRes.response;

        const authorizationEntityRes = await this.authorizationsService.search({
            id: ticketEntity.authorization,
            grantee: ticketEntity.owner,
            granter,
            mode: 'mint',
        });

        if (authorizationEntityRes.error || authorizationEntityRes.response.length === 0) {
            throw new NestError(
                `Unable to retrieve linked authorization: ${authorizationEntityRes.error || 'authorization not found'}`,
            );
        }

        const authorizationEntity: AuthorizationEntity = authorizationEntityRes.response[0];

        const code = encode(['uint256'], [AuthorizationEntity.getCodes(authorizationEntity)[0]]).toLowerCase();
        const receivedCode = encode(['uint256'], [decimalToHex(returnValues.code)]).toLowerCase();

        if (code !== receivedCode) {
            throw new NestError(
                `Invalid broadcasted authorization code: got ${receivedCode} but was expecting ${code}`,
            );
        }

        const authorizationDryUpdateRes = await this.authorizationsService.dryUpdate(
            {
                id: ticketEntity.authorization,
                grantee: ticketEntity.owner,
                granter,
                mode: 'mint',
            },
            {
                consumed: true,
            },
        );

        const ticketDryUpdateRes = await this.ticketsService.dryUpdate(
            {
                id: ticketEntity.id,
            },
            {
                status: 'ready',
            },
        );

        const authorizationRollbackDryUpdateRes = await this.authorizationsService.dryUpdate(
            {
                id: ticketEntity.authorization,
                grantee: ticketEntity.owner,
                granter,
                mode: 'mint',
            },
            {
                consumed: false,
            },
        );

        const ticketRollbackDryUpdateRes = await this.ticketsService.dryUpdate(
            {
                id: ticketEntity.id,
            },
            {
                status: 'minting',
            },
        );

        if (
            authorizationDryUpdateRes.error ||
            ticketDryUpdateRes.error ||
            authorizationRollbackDryUpdateRes.error ||
            ticketRollbackDryUpdateRes.error
        ) {
            throw new NestError(`Cannot create dry update payloads`);
        }

        append(authorizationDryUpdateRes.response, authorizationRollbackDryUpdateRes.response);

        append(ticketDryUpdateRes.response, ticketRollbackDryUpdateRes.response);

        this.loggerService.log(`Intercepted ticket blockchain incrustation for Ticket@${ticketEntity.id}`);
    }

    /**
     * Event Converter
     *
     * @param event
     * @param append
     */
    async convert(event: EVMProcessableEvent, append: Appender): Promise<any> {
        const returnValues = JSON.parse(event.return_values);

        const ticketEntityRes = await this.ticketsService.search({
            id: returnValues.ticket_id,
        });

        if (ticketEntityRes.error) {
            throw new NestError(`Error while fetching tickets: ${ticketEntityRes.error}`);
        }

        if (ticketEntityRes.response.length !== 0) {
            await this.existingTicketHandler(event, append, ticketEntityRes.response[0]);
        }
    }
}
