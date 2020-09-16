import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    Injectable,
    Post,
    UseFilters,
    UseGuards,
    Delete,
    Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { StripeInterfacesService } from '@lib/common/stripeinterface/StripeInterfaces.service';
import { PaymentStripeFetchInterfaceResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { PaymentStripeCreateConnectAccountInputDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateConnectAccountInput.dto';
import { PaymentStripeCreateConnectAccountResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateConnectAccountResponse.dto';
import { PaymentStripeAddExternalAccountInputDto }           from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountInput.dto';
import { PaymentStripeAddExternalAccountResponseDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountResponse.dto';
import { PaymentStripeGenerateOnboardingUrlInputDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateOnboardingUrlInput.dto';
import { PaymentStripeGenerateOnboardingUrlResponseDto }     from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateOnboardingUrlResponse.dto';
import { PaymentStripeGenerateUpdateUrlInputDto }            from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateUpdateUrlInput.dto';
import { PaymentStripeGenerateUpdateUrlResponseDto }         from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateUpdateUrlResponse.dto';
import { PaymentStripeRemoveExternalAccountInputDto }        from './dto/PaymentStripeRemoveExternalAccountInput.dto';
import { PaymentStripeRemoveExternalAccountResponseDto }     from './dto/PaymentStripeRemoveExternalAccountResponse.dto';
import { PaymentStripeSetDefaultExternalAccountInputDto }    from './dto/PaymentStripeSetDefaultExternalAccountInput.dto';
import { PaymentStripeSetDefaultExternalAccountResponseDto } from './dto/PaymentStripeSetDefaultExternalAccountResponse.dto';
import { PaymentStripeFetchBalanceResponseDto }              from './dto/PaymentStripeFetchBalanceResponse.dto';
import { PaymentStripePayoutInputDto }                       from '@app/server/controllers/payment/stripe/dto/PaymentStripePayoutInput.dto';
import { PaymentStripePayoutResponseDto }                    from '@app/server/controllers/payment/stripe/dto/PaymentStripePayoutResponse.dto';
import { PaymentStripeTransactionsInputDto }                 from '@app/server/controllers/payment/stripe/dto/PaymentStripeTransactionsInput.dto';
import { PaymentStripeTransactionsResponseDto }              from '@app/server/controllers/payment/stripe/dto/PaymentStripeTransactionsResponse.dto';

/**
 * Controller exposing routes to manage the Stripe Interface of an user
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('stripe')
@Controller('payment/stripe')
export class StripeController extends ControllerBasics<StripeInterfaceEntity> {
    /**
     * Dependency Injection
     *
     * @param stripeInterfacesService
     */
    constructor(private readonly stripeInterfacesService: StripeInterfacesService) {
        super();
    }

    /**
     * Recover the Stripe Interface of authenticated user
     *
     * @param user
     */
    @Get('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async fetch(@User() user: UserDto): Promise<PaymentStripeFetchInterfaceResponseDto> {
        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        return {
            stripe_interface: stripeInterface,
        };
    }

    /**
     * Create a Stripe interface for the authenticated user
     *
     * @param user
     */
    @Post('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async create(@User() user: UserDto): Promise<PaymentStripeFetchInterfaceResponseDto> {
        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.createStripeInterface(user),
            StatusCodes.InternalServerError,
        );

        return {
            stripe_interface: stripeInterface,
        };
    }

    /**
     * Recover Balance of the Stripe Interface
     *
     * @param user
     */
    @Get('/connect-account/balance')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async fetchBalance(@User() user: UserDto): Promise<PaymentStripeFetchBalanceResponseDto> {
        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        if (!stripeInterface?.connect_account) {
            return {
                balance: null,
            };
        }

        const balance = await this._serviceCall(
            this.stripeInterfacesService.recoverBalance(stripeInterface),
            StatusCodes.InternalServerError,
        );

        return {
            balance,
        };
    }

    /**
     * Create a Stripe Connect Account
     *
     * @param body
     * @param user
     */
    @Post('/connect-account')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async createConnectAccount(
        @Body() body: PaymentStripeCreateConnectAccountInputDto,
        @User() user: UserDto,
    ): Promise<PaymentStripeCreateConnectAccountResponseDto> {

        const connectAccount = await this._serviceCall(
            this.stripeInterfacesService.createAccount(user, body.account_token, body.currency),
            StatusCodes.InternalServerError,
        );

        const updatedInterface = await this._serviceCall(
            this.stripeInterfacesService.bindAccountToUserInterface(user, connectAccount),
            StatusCodes.InternalServerError,
        );

        return {
            stripe_interface: updatedInterface,
        };

    }

    /**
     * Add an external account to the Stripe Connect account
     * @param body
     * @param user
     */
    @Post('/connect-account/external-account')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async addExternalBankAccount(
        @Body() body: PaymentStripeAddExternalAccountInputDto,
        @User() user: UserDto,
    ): Promise<PaymentStripeAddExternalAccountResponseDto> {
        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        if (!stripeInterface.connect_account) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'no_connect_account',
                },
                StatusCodes.Forbidden,
            );
        }

        const updatedStripeInterface = await this._serviceCall(
            this.stripeInterfacesService.addExternalAccountToUserInterface(user, body.bank_account_token),
            StatusCodes.InternalServerError,
        );

        return {
            stripe_interface: updatedStripeInterface,
        };
    }

    /**
     * Set provided External Account as default for its currency
     *
     * @param body
     * @param user
     */
    @Put('/connect-account/external-account/default')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async setDefaultExternalBankAccount(
        @Body() body: PaymentStripeSetDefaultExternalAccountInputDto,
        @User() user: UserDto,
    ): Promise<PaymentStripeSetDefaultExternalAccountResponseDto> {
        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        if (!stripeInterface.connect_account) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'no_connect_account',
                },
                StatusCodes.Forbidden,
            );
        }

        const updatedStripeInterface = await this._serviceCall(
            this.stripeInterfacesService.setDefaultExternalAccountOnUserInterface(user, body.external_account_id),
            StatusCodes.InternalServerError,
        );

        return {
            stripe_interface: updatedStripeInterface,
        };
    }

    /**
     * Remove External Account from Stripe Connect Account
     *
     * @param body
     * @param user
     */
    @Delete('/connect-account/external-account')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async removeExternalBankAccount(
        @Body() body: PaymentStripeRemoveExternalAccountInputDto,
        @User() user: UserDto,
    ): Promise<PaymentStripeRemoveExternalAccountResponseDto> {
        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        if (!stripeInterface.connect_account) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'no_connect_account',
                },
                StatusCodes.Forbidden,
            );
        }

        const updatedStripeInterface = await this._serviceCall(
            this.stripeInterfacesService.removeExternalAccountFromUserInterface(user, body.external_account_id),
            StatusCodes.InternalServerError,
        );

        return {
            stripe_interface: updatedStripeInterface,
        };
    }

    /**
     * Generate an onboarding url
     *
     * @param body
     * @param user
     */
    @Post('/connect-account/onboarding')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async generateOnboardingUrl(
        @Body() body: PaymentStripeGenerateOnboardingUrlInputDto,
        @User() user: UserDto,
    ): Promise<PaymentStripeGenerateOnboardingUrlResponseDto> {
        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        const onboardingUrl = await this._serviceCall(
            this.stripeInterfacesService.generateOnboardingUrl(stripeInterface, body.refresh_url, body.return_url),
            StatusCodes.InternalServerError,
        );

        return {
            url: onboardingUrl.url,
            expires_at: onboardingUrl.expires_at,
            created: onboardingUrl.created,
        };
    }

    /**
     * Generate an update url
     *
     * @param body
     * @param user
     */
    @Post('/connect-account/update')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async generateUpdateUrl(
        @Body() body: PaymentStripeGenerateUpdateUrlInputDto,
        @User() user: UserDto,
    ): Promise<PaymentStripeGenerateUpdateUrlResponseDto> {
        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        const updateUrl = await this._serviceCall(
            this.stripeInterfacesService.generateUpdateUrl(stripeInterface, body.refresh_url, body.return_url),
            StatusCodes.InternalServerError,
        );

        return {
            url: updateUrl.url,
            expires_at: updateUrl.expires_at,
            created: updateUrl.created,
        };
    }

    /**
     * Triggers a payout
     *
     * @param body
     * @param user
     */
    @Post('/connect-account/payout')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async payout(
        @Body() body: PaymentStripePayoutInputDto,
        @User() user: UserDto,
    ): Promise<PaymentStripePayoutResponseDto> {

        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        const payout = await this._serviceCall(
            this.stripeInterfacesService.payout(
                stripeInterface,
                body.amount,
                body.destination,
                body.currency
            ),
            StatusCodes.InternalServerError,
        );

        return {
            payout
        };
    }

    /**
     * Recover transaction list
     *
     * @param body
     * @param user
     */
    @Post('/connect-account/transactions')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async transactions(
        @Body() body: PaymentStripeTransactionsInputDto,
        @User() user: UserDto,
    ): Promise<PaymentStripeTransactionsResponseDto> {

        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        const transactions = await this._serviceCall(
            this.stripeInterfacesService.transactions(
                stripeInterface,
                body.limit,
                body.starting_after
            ),
            StatusCodes.InternalServerError,
        );

        return {
            transactions
        };
    }

}
