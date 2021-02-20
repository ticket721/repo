import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    Param,
    Post,
    Put,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { EventsService } from '@lib/common/events/Events.service';
import { EventsSearchInputDto } from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto } from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { EventsBuildResponseDto } from '@app/server/controllers/events/dto/EventsBuildResponse.dto';
import { EventsBuildInputDto } from '@app/server/controllers/events/dto/EventsBuildInput.dto';
import {
    checkDate,
    checkEvent,
    DateCreationPayload,
    fromAtomicValue,
    getT721ControllerGroupID,
    symbolOf,
    toAcceptedAddressFormat,
} from '@common/global';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { EventsCountInputDto } from '@app/server/controllers/events/dto/EventsCountInput.dto';
import { EventsCountResponseDto } from '@app/server/controllers/events/dto/EventsCountResponse.dto';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { closestCity } from '@common/geoloc';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { EventsAddDateInputDto } from '@app/server/controllers/events/dto/EventsAddDateInput.dto';
import { EventsAddDateResponseDto } from '@app/server/controllers/events/dto/EventsAddDateResponse.dto';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { EventsEditInputDto } from '@app/server/controllers/events/dto/EventsEditInput.dto';
import { EventsEditResponseDto } from '@app/server/controllers/events/dto/EventsEditResponse.dto';
import { EventsBindStripeInterfaceInputDto } from '@app/server/controllers/events/dto/EventsBindStripeInterfaceInput.dto';
import { EventsBindStripeInterfaceResponseDto } from '@app/server/controllers/events/dto/EventsBindStripeInterfaceResponse.dto';
import { StripeInterfacesService } from '@lib/common/stripeinterface/StripeInterfaces.service';
import { EventsStatusInputDto } from '@app/server/controllers/events/dto/EventsStatusInput.dto';
import { EventsStatusResponseDto } from '@app/server/controllers/events/dto/EventsStatusResponse.dto';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { EventsOwnerResponseDto } from '@app/server/controllers/events/dto/EventsOwnerResponse.dto';
import { EventsAttendeesInputDto } from '@app/server/controllers/events/dto/EventsAttendeesInput.dto';
import { EventsAttendeesResponseDto } from '@app/server/controllers/events/dto/EventsAttendeesResponse.dto';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import { UsersService } from '@lib/common/users/Users.service';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { UserEntity } from '@lib/common/users/entities/User.entity';
import { PurchasesService } from '@lib/common/purchases/Purchases.service';
import { GeneratedProduct, PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { EventsExportInputDto } from '@app/server/controllers/events/dto/EventsExportInput.dto';
import { EventsExportResponseDto } from '@app/server/controllers/events/dto/EventsExportResponse.dto';
import { EventsSalesInputDto } from '@app/server/controllers/events/dto/EventsSalesInput.dto';
import { EventsSalesResponseDto, Transaction } from '@app/server/controllers/events/dto/EventsSalesResponse.dto';
import { OperationsService } from '@lib/common/operations/Operations.service';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder.helper';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { fromES } from '@lib/common/utils/fromES.helper';
import { slipTemplate } from './document_resources/slip.html';
import { EventsDocumentsInputDto } from '@app/server/controllers/events/dto/EventsDocumentsInput.dto';
import { EventsDocumentsResponseDto } from '@app/server/controllers/events/dto/EventsDocumentsResponse.dto';
import { OperationEntity } from '@lib/common/operations/entities/Operation.entity';
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn.type';
import { formatDay } from '@lib/common/utils/date';
import * as fs from 'fs';
import Zip from 'node-zip';
/**
 * Converts handlebar template to pdf
 */
// tslint:disable-next-line:no-var-requires
const PDF = require('handlebars-pdf');

/**
 * Placeholder address
 */
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Category summary for event slip
 */
interface SlipCategory {
    /**
     * Category name
     */
    name: string;
    /**
     * Category id
     */
    id: string;
    /**
     * Version of same category
     */
    version: number;
    /**
     * Price with all taxes
     */
    priceInclTaxes: string;
    /**
     * Quantity sold
     */
    quantity: string;
    /**
     * Vat amount
     */
    vat: string;
    /**
     * Total made with all taxes
     */
    totalInclTaxes: string;
    /**
     * Total vat
     */
    totalVat: string;
    /**
     * Total fees from the platform
     */
    totalPlatformFees: string;
    /**
     * Total revenue
     */
    totalRevenue: string;
    /**
     * Total to declare
     */
    totalToDeclare: string;
    /**
     * Currency symbol
     */
    cl: string;
}

/**
 * Summary of all category info
 */
interface SlipCategorySummary {
    /**
     * Total quantity of sold categories
     */
    quantity: string;
    /**
     * Total made including taxes
     */
    totalInclTaxes: string;
    /**
     * Total vat
     */
    totalVat: string;
    /**
     * Total platform fees
     */
    totalPlatformFees: string;
    /**
     * Total revenues
     */
    totalRevenue: string;
    /**
     * Total to declare
     */
    totalToDeclare: string;
}

/**
 * Fee summary for a category
 */
interface SlipFee {
    /**
     * Name of the category
     */
    name: string;
    /**
     * Id of the category
     */
    id: string;
    /**
     * Version of the same id
     */
    version: number;
    /**
     * Price with all taxes
     */
    priceInclTaxes: string;
    /**
     * Quantity sold
     */
    quantity: string;
    /**
     * Vat
     */
    vat: string;
    /**
     * Total vat
     */
    totalPlatformVat: string;
    /**
     * Total fees
     */
    totalPlatformFees: string;
    /**
     * Currency symbol
     */
    cl: string;
}

/**
 * Summary of fees for one category
 */
interface SlipFeeSummary {
    /**
     * Quantity sold
     */
    quantity: string;
    /**
     * Total fees
     */
    totalPlatformFees: string;
    /**
     * Total vat
     */
    totalPlatformVat: string;
}

/**
 * Events controller to create and fetch events
 */
@ApiBearerAuth()
@ApiTags('events')
@Controller('events')
export class EventsController extends ControllerBasics<EventEntity> {
    /**
     * Dependency Injection
     *
     * @param eventsService
     * @param ticketsService
     * @param datesService
     * @param categoriesService
     * @param uuidToolsService
     * @param usersService
     * @param purchasesService
     * @param stripeInterfacesService
     * @param operationsService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly ticketsService: TicketsService,
        private readonly datesService: DatesService,
        private readonly categoriesService: CategoriesService,
        private readonly uuidToolsService: UUIDToolService,
        private readonly usersService: UsersService,
        private readonly purchasesService: PurchasesService,
        private readonly stripeInterfacesService: StripeInterfacesService,
        private readonly operationsService: OperationsService,
    ) {
        super();
    }

    /**
     * Search for events
     *
     * @param body
     */
    @Post('/search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async search(@Body() body: EventsSearchInputDto): Promise<EventsSearchResponseDto> {
        const events = await this._search(this.eventsService, body as SearchInputType<EventEntity>);

        return {
            events,
        };
    }

    /**
     * Compute the sum of all operations
     *
     * @param operations
     * @param currency
     * @private
     */
    private getNetTotal(operations: OperationEntity[], currency: string): number {
        return operations
            .map((op: OperationEntity) => op.price - op.fee)
            .reduce((prev: number, curr: number) => prev + parseFloat(fromAtomicValue(currency, curr).toFixed(2)), 0);
    }

    /**
     * Compute gross from net value and vat
     *
     * @param net
     * @param tva
     * @private
     */
    private getGrossFromNet(net: number, tva: number): number {
        return parseFloat((net / (1 + tva)).toFixed(2));
    }

    /**
     * Retrieve formatted categories and fees
     *
     * @param operations
     * @param currency
     * @param vat
     * @private
     */
    private async getCategories(
        operations: OperationEntity[],
        currency: string,
        vat: number,
    ): Promise<[SlipCategory[], SlipCategorySummary, SlipFee[], SlipFeeSummary]> {
        const categoriesTracker: { [key: string]: OperationEntity[][] } = {};
        const categoryOperations = operations.filter(
            (op: OperationEntity) => op.status === 'confirmed' && op.type === 'sell',
        );
        const slipCategories: SlipCategory[] = [];
        const slipFees: SlipFee[] = [];

        for (const operation of categoryOperations) {
            if (!categoriesTracker[operation.category_id]) {
                categoriesTracker[operation.category_id] = [];
            }

            if (categoriesTracker[operation.category_id].length === 0) {
                categoriesTracker[operation.category_id].push([operation]);
            } else {
                const versions = categoriesTracker[operation.category_id].length;
                const productPrice = categoriesTracker[operation.category_id][versions - 1][0].price;
                const productQuantity = categoriesTracker[operation.category_id][versions - 1][0].quantity;
                const unitaryProductPrice = productPrice / productQuantity;

                if (operation.price / operation.quantity !== unitaryProductPrice) {
                    categoriesTracker[operation.category_id].push([operation]);
                } else {
                    categoriesTracker[operation.category_id][versions - 1].push(operation);
                }
            }
        }

        for (const category of Object.keys(categoriesTracker)) {
            for (let version = 0; version < categoriesTracker[category].length; ++version) {
                const quantity = categoriesTracker[category][version]
                    .map((op: OperationEntity) => op.quantity)
                    .reduce((agg: number, curr: number) => agg + curr, 0);
                const totalPrice = categoriesTracker[category][version]
                    .map((op: OperationEntity) => op.price)
                    .reduce((agg: number, curr: number) => agg + curr, 0);
                const totalFees = categoriesTracker[category][version]
                    .map((op: OperationEntity) => op.fee)
                    .reduce((agg: number, curr: number) => agg + curr, 0);
                const totalTva = totalPrice - totalFees - this.getGrossFromNet(totalPrice - totalFees, vat / 100);
                const totalPlatformTva = totalFees - this.getGrossFromNet(totalFees, 20 / 100);
                const categoryEntity = await this._crudCall(
                    this.categoriesService.findOne(category),
                    StatusCodes.InternalServerError,
                );

                slipCategories.push({
                    name: categoryEntity.display_name,
                    cl: symbolOf(currency) || '',
                    id: category,
                    version: version + 1,
                    priceInclTaxes: fromAtomicValue(currency, totalPrice / quantity).toFixed(2),
                    quantity: quantity.toString(),
                    vat: vat.toString(),
                    totalInclTaxes: fromAtomicValue(currency, totalPrice).toFixed(2),
                    totalVat: fromAtomicValue(currency, totalTva).toFixed(2),
                    totalPlatformFees: fromAtomicValue(currency, totalFees).toFixed(2),
                    totalRevenue: fromAtomicValue(currency, totalPrice - totalFees - totalTva).toFixed(2),
                    totalToDeclare: fromAtomicValue(currency, totalPrice - totalFees).toFixed(2),
                });

                slipFees.push({
                    name: categoryEntity.display_name,
                    cl: symbolOf(currency) || '',
                    id: category,
                    version: version + 1,
                    priceInclTaxes: fromAtomicValue(currency, totalPrice / quantity).toFixed(2),
                    quantity: quantity.toString(),
                    vat: '20',
                    totalPlatformVat: fromAtomicValue(currency, totalPlatformTva).toFixed(2),
                    totalPlatformFees: fromAtomicValue(currency, totalFees).toFixed(2),
                });
            }
        }

        const categoriesSummary: SlipCategorySummary = {
            quantity: slipCategories
                .map((sp: SlipCategory) => parseInt(sp.quantity, 10))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toString(),
            totalInclTaxes: slipCategories
                .map((sp: SlipCategory) => parseFloat(sp.totalInclTaxes))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toFixed(2),
            totalVat: slipCategories
                .map((sp: SlipCategory) => parseFloat(sp.totalVat))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toFixed(2),
            totalPlatformFees: slipCategories
                .map((sp: SlipCategory) => parseFloat(sp.totalPlatformFees))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toFixed(2),
            totalRevenue: slipCategories
                .map((sp: SlipCategory) => parseFloat(sp.totalRevenue))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toFixed(2),
            totalToDeclare: slipCategories
                .map((sp: SlipCategory) => parseFloat(sp.totalToDeclare))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toFixed(2),
        };

        const feesSummary: SlipFeeSummary = {
            quantity: slipFees
                .map((sp: SlipFee) => parseInt(sp.quantity, 10))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toString(),
            totalPlatformVat: slipFees
                .map((sp: SlipFee) => parseFloat(sp.totalPlatformVat))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toFixed(2),
            totalPlatformFees: slipFees
                .map((sp: SlipFee) => parseFloat(sp.totalPlatformFees))
                .reduce((agg: number, curr: number) => agg + curr, 0)
                .toFixed(2),
        };

        return [slipCategories, categoriesSummary, slipFees, feesSummary];
    }

    /**
     * Compute date range based on event dates
     *
     * @param gpid
     * @private
     */
    private async getDateRange(gpid: string): Promise<string> {
        const dates = await this._crudCall(this.datesService.findAllByGroupId(gpid), StatusCodes.InternalServerError);
        let lowestDate = new Date(dates[0]?.timestamps.event_begin || null);
        let highestDate = new Date(dates[0]?.timestamps.event_begin || null);

        for (const date of dates) {
            if (new Date(date.timestamps.event_begin).getTime() < lowestDate.getTime()) {
                lowestDate = new Date(date.timestamps.event_begin);
            }
            if (new Date(date.timestamps.event_end).getTime() > highestDate.getTime()) {
                highestDate = new Date(date.timestamps.event_end);
            }
        }

        const startString = formatDay(lowestDate.getTime());
        const endString = formatDay(highestDate.getTime());

        if (startString === endString) {
            return startString;
        } else {
            return `From ${startString} to ${endString}`;
        }
    }

    /**
     * Convert operations to raw csv
     *
     * @param operations
     * @private
     */
    private operationsToCsv(operations: OperationEntity[]): string {
        let res = ``;
        for (const operation of operations) {
            res = `${res}${operation.id},${operation.purchase_id},${operation.client_email},${operation.currency ||
                'FREE'},${operation.group_id},${operation.category_id},${operation.ticket_ids.join(' ')},${
                operation.type
            },${operation.status},${operation.quantity},${
                operation.currency ? fromAtomicValue(operation.currency, operation.fee).toFixed(2) : '0'
            },${operation.currency ? fromAtomicValue(operation.currency, operation.price) : '0'},${new Date(
                operation.created_at,
            ).toISOString()}
`;
        }

        return res;
    }

    /**
     * Get event slip
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Post('/:event/documents')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async exportDocuments(
        @Body() body: EventsDocumentsInputDto,
        @Param('event') eventId: string,
        @User() user: UserDto,
    ): Promise<EventsDocumentsResponseDto> {
        const exportId = this.uuidToolsService.generate();

        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (event.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_category_id',
                },
                StatusCodes.Forbidden,
            );
        }

        const eventTva = body.organizerTva / 100;

        const elasticCountBody = ESSearchBodyBuilder({
            group_id: {
                $eq: event.group_id,
            },
            type: {
                $in: ['sell', 'invitation'],
            },
        } as SortablePagedSearch);

        const operationsCount = await this._crudCall(
            this.operationsService.countElastic(elasticCountBody.response),
            StatusCodes.InternalServerError,
        );

        const elasticBody = ESSearchBodyBuilder({
            group_id: {
                $eq: event.group_id,
            },
            type: {
                $in: ['sell', 'invitation'],
            },
            $sort: [
                {
                    $field_name: 'created_at',
                    $order: 'asc',
                },
            ],
            $page_size: operationsCount.count,
            $page_index: 0,
        } as SortablePagedSearch);

        const operationsHits = await this._crudCall(
            this.operationsService.searchElastic(elasticBody.response),
            StatusCodes.InternalServerError,
        );

        const operations = operationsHits.hits.hits.map((v: ESSearchHit<OperationEntity>) => fromES(v));

        const paidOperations = operations.filter(
            (op: OperationEntity) => op.type === 'sell' && op.status === 'confirmed' && op.price > 0,
        );
        let currency = 'FREE';
        if (paidOperations.length) {
            currency = paidOperations[0].currency;
        }
        const eventNetTotal = this.getNetTotal(operations, currency);
        const eventGrossTotal = this.getGrossFromNet(eventNetTotal, eventTva);
        const paidParticipantsCount = operations.filter(
            (op: OperationEntity) => op.type === 'sell' && op.status === 'confirmed' && op.price > 0,
        ).length;
        const freeParticipantsCount = operations.filter(
            (op: OperationEntity) => op.type === 'sell' && op.status === 'confirmed' && op.price === 0,
        ).length;
        const invitedParticipantsCount =
            operations.filter((op: OperationEntity) => op.type === 'invitation' && op.status === 'confirmed').length -
            operations.filter((op: OperationEntity) => op.type === 'invitation' && op.status === 'cancelled').length;
        const categories = await this.getCategories(operations, currency, body.organizerTva);
        const dateRange = await this.getDateRange(event.group_id);
        const path = `/tmp/slip.${exportId}.pdf`;

        const document = {
            template: slipTemplate,
            context: {
                eventSlipId: exportId,

                cl: symbolOf(currency) || '',

                orgId: user.id,
                orgName: body.organizerName,
                orgTvaId: body.organizerTvaId,
                orgLicenseId: body.organizerLicenseId,
                orgStreet: body.organizerStreet,
                orgCity: body.organizerCity,
                orgPostalCode: body.organizerPostalCode,
                orgCountry: body.organizerCountry,

                vat: body.organizerTva.toString(),
                currentDate: formatDay(Date.now()),
                eventId: event.id,
                eventName: event.name,
                eventDates: dateRange,

                paidParticipantsCount,
                freeParticipantsCount,
                invitedParticipantsCount,
                totalParticipantCount: paidParticipantsCount + freeParticipantsCount + invitedParticipantsCount,

                grossSubtotalToDeclare: eventGrossTotal.toFixed(2),
                subtotalToDeclare: eventNetTotal.toFixed(2),

                grossTotalToDeclare: eventGrossTotal.toFixed(2),
                totalToDeclare: eventNetTotal.toFixed(2),

                ticketingGrossSubtotal: eventGrossTotal.toFixed(2),
                ticketingSubtotal: eventNetTotal.toFixed(2),

                ticketingGrossTotal: eventGrossTotal.toFixed(2),
                ticketingTotal: eventNetTotal.toFixed(2),

                revenueGrossTotal: eventGrossTotal.toFixed(2),
                revenueTotal: eventNetTotal.toFixed(2),

                salesByCategory: categories[0],
                salesByCategoryTotal: categories[1],

                feesByCategory: categories[2],
                feesByCategoryTotal: categories[3],
            },
            path,
            options: {
                width: '1240px',
                height: '1754px',
                border: '0',
                format: null,
                orientation: null,
            },
        };

        await PDF.create(document);

        const slip = fs.readFileSync(path);
        fs.unlinkSync(path);

        const rawOperations = Buffer.from(`operation,purchase_id,client_email,currency,group_id,category_id,ticket_ids,type,status,quantity,fee,price,date,
${this.operationsToCsv(operations)}`);

        const zip = Zip();
        zip.file('slip.pdf', slip);
        zip.file('operations.csv', rawOperations);
        const b64ZipDocument = zip.generate({ base64: true, compression: 'DEFLATE' });

        return {
            b64ZipDocument,
        };
    }

    /**
     * Recover event owner
     *
     * @param eventId
     */
    @Get('/owner/:event')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async ownerOf(@Param('event') eventId: string): Promise<EventsOwnerResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        return {
            owner: event.owner,
        };
    }

    /**
     * Full export
     *
     * @param eventId
     * @param body
     * @param user
     */
    @Post('/:event/export')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async _export(
        @Param('event') eventId: string,
        @Body() body: EventsExportInputDto,
        @User() user: UserDto,
    ): Promise<EventsExportResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (event.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_category_id',
                },
                StatusCodes.Forbidden,
            );
        }

        const categoriesOfEvent = await this._crudCall(
            this.categoriesService.findAllByGroupId(event.group_id),
            StatusCodes.InternalServerError,
        );

        let filterCategories: string[] = categoriesOfEvent.map((cat: CategoryEntity) => cat.id);

        if (body.categories) {
            for (const categoryId of body.categories) {
                if (categoriesOfEvent.findIndex((cat: CategoryEntity) => cat.id === categoryId) === -1) {
                    throw new HttpException(
                        {
                            status: StatusCodes.Forbidden,
                            message: 'invalid_category_id',
                        },
                        StatusCodes.Forbidden,
                    );
                }
            }
            filterCategories = body.categories;
        }

        const ticketsTotal = await this._crudCall(
            this.ticketsService.countAllByCategories(filterCategories),
            StatusCodes.InternalServerError,
        );
        const tickets = await this._crudCall(
            this.ticketsService.findAllByCategories(filterCategories, ticketsTotal, 0),
            StatusCodes.InternalServerError,
        );

        if (tickets.length === 0) {
            return {
                attendees: [],
                total: 0,
            };
        }

        const userIds = tickets.map((ticket: TicketEntity) => ticket.owner);
        const users = await this._serviceCall(this.usersService.findByIds(userIds), StatusCodes.InternalServerError);

        const purchasesIds = tickets.map((ticket: TicketEntity) => ticket.receipt);
        const purchases = await this._serviceCall(
            this.purchasesService.findMany(purchasesIds),
            StatusCodes.InternalServerError,
        );

        return {
            attendees: tickets.map((ticket: TicketEntity) => {
                // tslint:disable-next-line:variable-name
                const _user = users[users.findIndex((__user: UserEntity) => __user.id.toString() === ticket.owner)];
                const purchase =
                    purchases[purchases.findIndex((_purchase: PurchaseEntity) => _purchase.id === ticket.receipt)];
                const generatedItemsIdx = purchase?.generated_products?.findIndex(
                    (gp: GeneratedProduct): boolean => gp.id === ticket.id,
                );
                let price = 0;
                let currency = 'FREE';
                if (!isNil(generatedItemsIdx) && generatedItemsIdx !== -1) {
                    price = purchase.generated_products[generatedItemsIdx].price;
                    currency = purchase.generated_products[generatedItemsIdx].currency;
                }

                return {
                    ticket: ticket.id,
                    category: ticket.category,
                    date: ticket.created_at,
                    price,
                    currency,
                    email: _user?.email || null,
                };
            }),
            total: ticketsTotal,
        };
    }

    /**
     * Attendees recovery
     *
     * @param eventId
     * @param body
     * @param user
     */
    @Post('/:event/sales')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async sales(
        @Param('event') eventId: string,
        @Body() body: EventsSalesInputDto,
        @User() user: UserDto,
    ): Promise<EventsSalesResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (event.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_category_id',
                },
                StatusCodes.Forbidden,
            );
        }

        const purchases = await this._serviceCall(
            this.purchasesService.findPlageByGroupId(
                event.group_id,
                body.start ? new Date(body.start) : null,
                body.end ? new Date(body.end) : null,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            transactions: purchases.map(
                (purchaseEntity: PurchaseEntity): Transaction => ({
                    price: purchaseEntity.final_price || 0,
                    currency: purchaseEntity.currency || 'FREE',
                    date: purchaseEntity.checked_out_at,
                    status: purchaseEntity.payment?.status || 'waiting',
                    quantity: 1,
                }),
            ),
        };
    }
    /**
     * Attendees recovery
     *
     * @param eventId
     * @param body
     * @param user
     */
    @Post('/:event/attendees')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async attendees(
        @Param('event') eventId: string,
        @Body() body: EventsAttendeesInputDto,
        @User() user: UserDto,
    ): Promise<EventsAttendeesResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (event.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_category_id',
                },
                StatusCodes.Forbidden,
            );
        }

        const categoriesOfEvent = await this._crudCall(
            this.categoriesService.findAllByGroupId(event.group_id),
            StatusCodes.InternalServerError,
        );

        let filterCategories: string[] = categoriesOfEvent.map((cat: CategoryEntity) => cat.id);

        if (body.categories) {
            for (const categoryId of body.categories) {
                if (categoriesOfEvent.findIndex((cat: CategoryEntity) => cat.id === categoryId) === -1) {
                    throw new HttpException(
                        {
                            status: StatusCodes.Forbidden,
                            message: 'invalid_category_id',
                        },
                        StatusCodes.Forbidden,
                    );
                }
            }
            filterCategories = body.categories;
        }

        const ticketsTotal = await this._crudCall(
            this.ticketsService.countAllByCategories(filterCategories),
            StatusCodes.InternalServerError,
        );
        const tickets = await this._crudCall(
            this.ticketsService.findAllByCategories(filterCategories, body.page_size, body.page_number),
            StatusCodes.InternalServerError,
        );

        if (tickets.length === 0) {
            return {
                attendees: [],
                page_size: body.page_size,
                page_number: body.page_number,
                total: ticketsTotal,
            };
        }

        const userIds = tickets.map((ticket: TicketEntity) => ticket.owner);
        const users = await this._serviceCall(this.usersService.findByIds(userIds), StatusCodes.InternalServerError);

        const purchasesIds = tickets.map((ticket: TicketEntity) => ticket.receipt);
        const purchases = await this._serviceCall(
            this.purchasesService.findMany(purchasesIds),
            StatusCodes.InternalServerError,
        );

        return {
            attendees: tickets.map((ticket: TicketEntity) => {
                // tslint:disable-next-line:variable-name
                const _user = users[users.findIndex((__user: UserEntity) => __user.id.toString() === ticket.owner)];
                const purchase =
                    purchases[purchases.findIndex((_purchase: PurchaseEntity) => _purchase.id === ticket.receipt)];
                const generatedItemsIdx = purchase?.generated_products?.findIndex(
                    (gp: GeneratedProduct): boolean => gp.id === ticket.id,
                );
                let price = 0;
                let currency = 'FREE';
                if (!isNil(generatedItemsIdx) && generatedItemsIdx !== -1) {
                    price = purchase.generated_products[generatedItemsIdx].price;
                    currency = purchase.generated_products[generatedItemsIdx].currency;
                }

                return {
                    ticket: ticket.id,
                    category: ticket.category,
                    date: ticket.created_at,
                    price,
                    currency,
                    email: _user?.email || null,
                };
            }),
            page_size: body.page_size,
            page_number: body.page_number,
            total: ticketsTotal,
        };
    }

    /**
     * Count for events
     *
     * @param body
     */
    @Post('/count')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async count(@Body() body: EventsCountInputDto): Promise<EventsCountResponseDto> {
        const events = await this._count(this.eventsService, body as SearchInputType<EventEntity>);

        return {
            events,
        };
    }

    /**
     * Internal helper to create event dates
     *
     * @param body
     * @param event
     * @private
     */
    private async createDates(body: EventsBuildInputDto, event: EventEntity): Promise<DateEntity[]> {
        const dates: DateEntity[] = [];

        for (const date of body.eventPayload.datesConfiguration) {
            const dateEntity = await this._crudCall(
                this.datesService.createDate({
                    group_id: event.group_id,
                    status: 'preview',
                    categories: [],
                    online: date.online,
                    online_link: date.online_link,
                    location: date.online
                        ? null
                        : {
                              location: {
                                  lat: date.location.lat,
                                  lon: date.location.lon,
                              },
                              location_label: date.location.label,
                              assigned_city: closestCity(date.location).id,
                          },
                    timestamps: {
                        event_begin: new Date(date.eventBegin),
                        event_end: new Date(date.eventEnd),
                    },
                    metadata: {
                        name: date.name,
                        description: body.eventPayload.textMetadata.name,
                        avatar: body.eventPayload.imagesMetadata.avatar,
                        signature_colors: body.eventPayload.imagesMetadata.signatureColors,
                        twitter: body.eventPayload.textMetadata.twitter,
                        spotify: body.eventPayload.textMetadata.spotify,
                        website: body.eventPayload.textMetadata.website,
                        facebook: body.eventPayload.textMetadata.facebook,
                        email: body.eventPayload.textMetadata.email,
                        linked_in: body.eventPayload.textMetadata.linked_in,
                        tiktok: body.eventPayload.textMetadata.tiktok,
                        instagram: body.eventPayload.textMetadata.instagram,
                    },
                }),
                StatusCodes.InternalServerError,
            );

            await this._crudCall(this.eventsService.addDate(event.id, dateEntity), StatusCodes.InternalServerError);

            dates.push({
                ...dateEntity,
                event: event.id,
            });
        }

        return dates;
    }

    /**
     * Internal helper to create categories
     *
     * @param body
     * @param event
     * @param dates
     * @private
     */
    private async createCategories(
        body: EventsBuildInputDto,
        event: EventEntity,
        dates: DateEntity[],
    ): Promise<CategoryEntity[]> {
        const categories: CategoryEntity[] = [];

        for (const category of body.eventPayload.categoriesConfiguration) {
            const categoryId = this.uuidToolsService.generate();

            const categoryEntity = await this._crudCall(
                this.categoriesService.create({
                    id: categoryId,
                    group_id: event.group_id,
                    category_name: categoryId,
                    display_name: category.name,
                    sale_begin: category.saleBegin,
                    sale_end: category.saleEnd,
                    price: category.price,
                    currency: category.currency,
                    interface: CategoriesService.interfaceFromCurrencyAndPrice(category.currency, category.price),
                    seats: category.seats,
                    status: 'preview',
                    custom_static_fee: null,
                    custom_percent_fee: null,
                }),
                StatusCodes.InternalServerError,
            );

            for (const dateIdx of category.dates) {
                await this._crudCall(
                    this.datesService.addCategory(dates[dateIdx].id, categoryEntity),
                    StatusCodes.InternalServerError,
                );

                categoryEntity.dates = [...categoryEntity.dates, dates[dateIdx].id];
            }

            categories.push({
                ...categoryEntity,
                dates: category.dates.map((idx: number) => dates[idx].id),
            });
        }

        return categories;
    }

    /**
     * Converts a completed actionset into an Event entity. In preview mode.
     *
     * @param body
     * @param user
     */
    @Post('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async create(@Body() body: EventsBuildInputDto, @User() user: UserDto): Promise<EventsBuildResponseDto> {
        const checkResult = checkEvent(body.eventPayload);

        if (checkResult) {
            return {
                error: checkResult,
            };
        }

        // Generate Event ID
        const eventId = this.uuidToolsService.generate();

        const rocksideEOA = {
            address: ZERO_ADDRESS,
        };

        // Compute address and groupId
        const eventAddress = toAcceptedAddressFormat(rocksideEOA.address);
        const groupId = getT721ControllerGroupID(eventId, eventAddress);

        const event = await this._crudCall<EventEntity>(
            this.eventsService.create({
                id: eventId,
                status: 'preview',
                group_id: groupId,
                owner: user.id,
                name: body.eventPayload.textMetadata.name,
                avatar: body.eventPayload.imagesMetadata.avatar,
                description: body.eventPayload.textMetadata.description,
                address: eventAddress,
                signature_colors: body.eventPayload.imagesMetadata.signatureColors,
                controller: eventAddress,
                dates: [],
                custom_static_fee: null,
                custom_percent_fee: null,
            }),
            StatusCodes.InternalServerError,
        );

        const dates: DateEntity[] = await this.createDates(body, event);
        await this.createCategories(body, event, dates);

        return {
            error: null,
            event: {
                ...event,
                dates: dates.map((date: DateEntity) => date.id),
            },
        };
    }

    /**
     * Internal helper to check if user is event owner
     *
     * @param event
     * @param user
     * @private
     */
    private static isEventOwner(event: EventEntity, user: UserDto): boolean {
        return event.owner === user.id;
    }

    /**
     * Add a date to an event
     *
     * @param body
     * @param user
     * @param eventId
     */
    @Post('/:event/date')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async addDate(
        @Body() body: EventsAddDateInputDto,
        @User() user: UserDto,
        @Param('event') eventId: string,
    ): Promise<EventsAddDateResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.NotFound);

        if (!EventsController.isEventOwner(event, user)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        const checkResult = checkDate(body.date);

        if (checkResult) {
            return {
                error: checkResult,
            };
        }

        const datePayload: DateCreationPayload = body.date;

        const date = await this._crudCall(
            this.datesService.createDate({
                group_id: event.group_id,
                status: 'preview',
                categories: [],
                online: datePayload.info.online,
                online_link: datePayload.info.online_link,
                location: datePayload.info.online
                    ? null
                    : {
                          location: {
                              lat: datePayload.info.location.lat,
                              lon: datePayload.info.location.lon,
                          },
                          location_label: datePayload.info.location.label,
                          assigned_city: closestCity(datePayload.info.location).id,
                      },
                timestamps: {
                    event_begin: new Date(datePayload.info.eventBegin),
                    event_end: new Date(datePayload.info.eventEnd),
                },
                metadata: {
                    name: datePayload.textMetadata.name,
                    description: datePayload.textMetadata.description,
                    avatar: datePayload.imagesMetadata.avatar,
                    signature_colors: datePayload.imagesMetadata.signatureColors,
                    twitter: datePayload.textMetadata.twitter,
                    spotify: datePayload.textMetadata.spotify,
                    website: datePayload.textMetadata.website,
                    facebook: datePayload.textMetadata.facebook,
                    email: datePayload.textMetadata.email,
                    linked_in: datePayload.textMetadata.linked_in,
                    tiktok: datePayload.textMetadata.tiktok,
                    instagram: datePayload.textMetadata.instagram,
                },
            }),
            StatusCodes.InternalServerError,
        );

        await this._crudCall(this.eventsService.addDate(eventId, date), StatusCodes.InternalServerError);

        return {
            date: {
                ...date,
                event: eventId,
            },
        };
    }

    /**
     * Edit an event
     *
     * @param body
     * @param user
     * @param eventId
     */
    @Put('/:event')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async edit(
        @Body() body: EventsEditInputDto,
        @User() user: UserDto,
        @Param('event') eventId: string,
    ): Promise<EventsEditResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (!EventsController.isEventOwner(event, user)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        await this._crudCall(
            this.eventsService.update(
                {
                    id: eventId,
                },
                {
                    avatar: body.avatar || event.avatar,
                    name: body.name || event.name,
                    description: body.description || event.description,
                    signature_colors: body.signature_colors || event.signature_colors,
                },
            ),
            StatusCodes.InternalServerError,
        );

        return {
            event: {
                ...event,
                ...body,
            },
        };
    }

    /**
     * Bind stripe interface to event
     *
     * @param body
     * @param user
     * @param eventId
     */
    @Put('/:event/bind-stripe-interface')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async bindStripeInterface(
        @Body() body: EventsBindStripeInterfaceInputDto,
        @User() user: UserDto,
        @Param('event') eventId: string,
    ): Promise<EventsBindStripeInterfaceResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (!EventsController.isEventOwner(event, user)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        const callerInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        if (callerInterface === null) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'caller_has_no_stripe_interface',
                },
                StatusCodes.Unauthorized,
            );
        }

        if (body.stripe_interface_id !== callerInterface.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'stripe_interface_not_owned',
                },
                StatusCodes.Unauthorized,
            );
        }

        await this._crudCall(
            this.eventsService.update(
                {
                    id: eventId,
                },
                {
                    stripe_interface: body.stripe_interface_id,
                },
            ),
            StatusCodes.InternalServerError,
        );

        return {
            event: {
                ...event,
                stripe_interface: body.stripe_interface_id,
            },
        };
    }

    /**
     * Resolve statuses updates
     *
     * @param dates
     * @param categories
     * @param input
     * @private
     */
    private resolveCategoryStatuses(
        dates: DateEntity[],
        categories: CategoryEntity[],
        input: { [key: string]: boolean },
    ): [CategoryEntity[], { [key: string]: boolean }] {
        const ret: { [key: string]: boolean } = {};

        if (!isNil(input)) {
            for (const categoryId of Object.keys(input)) {
                const category = categories.find((cat: CategoryEntity): boolean => cat.id === categoryId);

                if (!category) {
                    throw new HttpException(
                        {
                            status: StatusCodes.BadRequest,
                            message: 'invalid_category_id',
                        },
                        StatusCodes.BadRequest,
                    );
                }

                if (!isNil(input[categoryId])) {
                    if (input[categoryId] === true && category.status === 'preview') {
                        const liveDatesCount = dates.filter(
                            (date: DateEntity): boolean =>
                                category.dates.indexOf(date.id) !== -1 && date.status === 'live',
                        ).length;

                        if (liveDatesCount === 0) {
                            throw new HttpException(
                                {
                                    status: StatusCodes.BadRequest,
                                    message: 'cannot_live_category_with_no_live_dates',
                                },
                                StatusCodes.BadRequest,
                            );
                        }

                        ret[categoryId] = true;
                        category.status = 'live';
                    } else if (input[categoryId] === false && category.status === 'live') {
                        ret[categoryId] = false;
                        category.status = 'preview';
                    }
                }
            }
        }

        for (const category of categories) {
            if (category.status === 'live') {
                const liveDatesCount = dates.filter(
                    (date: DateEntity): boolean => category.dates.indexOf(date.id) !== -1 && date.status === 'live',
                ).length;

                if (liveDatesCount === 0) {
                    ret[category.id] = false;
                    category.status = 'preview';
                }
            }
        }

        return [categories, ret];
    }

    /**
     * Resolves statuses updates
     *
     * @param dates
     * @param input
     * @private
     */
    private resolveDateStatuses(
        dates: DateEntity[],
        input: { [key: string]: boolean },
    ): [DateEntity[], { [key: string]: boolean }] {
        if (isNil(input)) {
            return [dates, {}];
        }

        const ret: { [key: string]: boolean } = {};

        for (const dateId of Object.keys(input)) {
            const dateEntity = dates.find((date: DateEntity): boolean => date.id === dateId);

            if (!dateEntity) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'invalid_date_id',
                    },
                    StatusCodes.BadRequest,
                );
            }

            if (!isNil(input[dateId])) {
                if (input[dateId] === true && dateEntity.status === 'preview') {
                    ret[dateId] = true;
                    dateEntity.status = 'live';
                } else if (input[dateId] === false && dateEntity.status === 'live') {
                    ret[dateId] = false;
                    dateEntity.status = 'preview';
                }
            }
        }

        return [dates, ret];
    }

    /**
     * Update event date and category entities statuses
     *
     * @param eventId
     * @param eventStatus
     * @param dateEdits
     * @param categoryEdits
     * @private
     */
    private async updateEntities(
        eventId: string,
        eventStatus: boolean,
        dateEdits: { [key: string]: boolean },
        categoryEdits: { [key: string]: boolean },
    ): Promise<void> {
        if (!isNil(eventStatus)) {
            await this._crudCall(
                this.eventsService.update(
                    {
                        id: eventId,
                    },
                    {
                        status: eventStatus ? 'live' : 'preview',
                    },
                ),
                StatusCodes.InternalServerError,
                'cannot_update_event_status',
            );
        }

        for (const dateId of Object.keys(dateEdits)) {
            await this._crudCall(
                this.datesService.update(
                    {
                        id: dateId,
                    },
                    {
                        status: dateEdits[dateId] ? 'live' : 'preview',
                    },
                ),
                StatusCodes.InternalServerError,
                'cannot_update_date_status',
            );
        }

        for (const categoryId of Object.keys(categoryEdits)) {
            await this._crudCall(
                this.categoriesService.update(
                    {
                        id: categoryId,
                    },
                    {
                        status: categoryEdits[categoryId] ? 'live' : 'preview',
                    },
                ),
                StatusCodes.InternalServerError,
                'cannot_update_category_status',
            );
        }
    }

    /**
     * Check the interfaces required by the event
     *
     * @param user
     * @param event
     * @param categories
     * @private
     */
    private async verifyEventStripeInterfaceNeeds(
        user: UserDto,
        event: EventEntity,
        categories: CategoryEntity[],
    ): Promise<void> {
        const stripeInterfaceRequired: boolean =
            categories.filter((cat: CategoryEntity): boolean => cat.interface === 'stripe' && cat.status === 'live')
                .length !== 0;

        if (stripeInterfaceRequired) {
            if (isNil(event.stripe_interface)) {
                let ownerStripeInterface = await this._crudCall(
                    this.stripeInterfacesService.recoverUserInterface(user),
                    StatusCodes.InternalServerError,
                );

                if (ownerStripeInterface === null) {
                    ownerStripeInterface = await this._crudCall(
                        this.stripeInterfacesService.createStripeInterface(user),
                        StatusCodes.InternalServerError,
                    );
                }

                await this._crudCall(
                    this.eventsService.update(
                        {
                            id: event.id,
                        },
                        {
                            stripe_interface: ownerStripeInterface.id,
                        },
                    ),
                    StatusCodes.InternalServerError,
                );

                event.stripe_interface = ownerStripeInterface.id;
            }

            const stripeInterfaceRes = await this._crudCall(
                this.stripeInterfacesService.search({
                    id: event.stripe_interface,
                }),
                StatusCodes.InternalServerError,
            );

            if (stripeInterfaceRes.length === 0) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: 'stripe_interface_not_found',
                    },
                    StatusCodes.InternalServerError,
                );
            }

            const stripeInterface: StripeInterfaceEntity = stripeInterfaceRes[0];

            if (
                isNil(stripeInterface.connect_account_type) ||
                !isNil(stripeInterface.connect_account_disabled_reason)
            ) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'stripe_interface_not_ready',
                    },
                    StatusCodes.BadRequest,
                );
            }
        }
    }

    /**
     * Check if event can be published
     *
     * @param user
     * @param event
     * @param dates
     * @param categories
     * @private
     */
    private async verifyEventPublishability(
        user: UserDto,
        event: EventEntity,
        dates: DateEntity[],
        categories: CategoryEntity[],
    ): Promise<void> {
        await this.verifyEventStripeInterfaceNeeds(user, event, categories);
    }

    /**
     * Updated statuses of the event, its dates and its categories
     *
     * @param body
     * @param user
     * @param eventId
     */
    @Put('/:event/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async status(
        @Body() body: EventsStatusInputDto,
        @User() user: UserDto,
        @Param('event') eventId: string,
    ): Promise<EventsStatusResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (!EventsController.isEventOwner(event, user)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        const dates = await this._crudCall(
            this.datesService.findAllByGroupId(event.group_id),
            StatusCodes.InternalServerError,
        );

        const categories = await this._crudCall(
            this.categoriesService.findAllByGroupId(event.group_id),
            StatusCodes.InternalServerError,
        );

        let eventStatus: boolean;

        if (body.event === false && event.status === 'live') {
            const clearDateEditsBuilder = {};

            for (const date of dates) {
                clearDateEditsBuilder[date.id] = false;
            }

            const [clearUpdatedDates, clearDateEdits] = this.resolveDateStatuses(dates, clearDateEditsBuilder);
            const [, clearCategoryEdits] = this.resolveCategoryStatuses(clearUpdatedDates, categories, {});

            await this.updateEntities(eventId, false, clearDateEdits, clearCategoryEdits);

            return {
                event: {
                    ...event,
                    status: 'preview',
                },
            };
        } else if (body.event === true || event.status === 'live') {
            await this.verifyEventPublishability(
                user,
                event,
                dates.map(
                    (_date: DateEntity): DateEntity => {
                        if (body.dates && body.dates[_date.id] === true) {
                            return {
                                ..._date,
                                status: 'live',
                            };
                        }
                        return _date;
                    },
                ),
                categories.map(
                    (_category: CategoryEntity): CategoryEntity => {
                        if (body.categories && body.categories[_category.id] === true) {
                            return {
                                ..._category,
                                status: 'live',
                            };
                        }
                        return _category;
                    },
                ),
            );

            eventStatus = true;
            event.status = 'live';
        }

        if (event.status === 'live') {
            const [updatedDates, dateEdits] = this.resolveDateStatuses(dates, body.dates);
            const [, categoryEdits] = this.resolveCategoryStatuses(updatedDates, categories, body.categories);

            await this.updateEntities(eventId, eventStatus, dateEdits, categoryEdits);

            return {
                event: {
                    ...event,
                    status: isNil(eventStatus) ? event.status : 'live',
                },
            };
        } else {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'event_in_preview',
                },
                StatusCodes.BadRequest,
            );
        }
    }
}
