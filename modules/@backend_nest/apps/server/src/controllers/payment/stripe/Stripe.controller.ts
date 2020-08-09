import { Body, Controller, Get, HttpCode, HttpException, Injectable, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags }                                                                  from '@nestjs/swagger';
import { ControllerBasics }                                                         from '@lib/common/utils/ControllerBasics.base';
import { AuthGuard }                                                                from '@nestjs/passport';
import { Roles, RolesGuard }                                                        from '@app/server/authentication/guards/RolesGuard.guard';
import { ValidGuard }                                                               from '@app/server/authentication/guards/ValidGuard.guard';
import { HttpExceptionFilter }                           from '@app/server/utils/HttpException.filter';
import { StatusCodes }                                   from '@lib/common/utils/codes.value';
import { ApiResponses }                                  from '@app/server/utils/ApiResponses.controller.decorator';
import { User }                                          from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto }                                       from '@lib/common/users/dto/User.dto';
import { StripeInterfacesService }                       from '@lib/common/stripeinterface/StripeInterfaces.service';
import { PaymentStripeFetchInterfaceResponseDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
import { StripeInterfaceEntity }                         from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { PaymentStripeCreateStripeInterfaceInputDto }    from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateStripeInterfaceInput.dto';
import { PaymentStripeCreateStripeInterfaceResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateStripeInterfaceResponse.dto';
import { StripeService }                                 from '@lib/common/stripe/Stripe.service';
import { PaymentStripeAddExternalAccountInputDto }       from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountInput.dto';
import { PaymentStripeAddExternalAccountResponseDto }    from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountResponse.dto';

@Injectable()
@ApiBearerAuth()
@ApiTags('stripe')
@Controller('payment/stripe')
export class StripeController extends ControllerBasics<StripeInterfaceEntity> {
    constructor(
        private readonly stripeInterfacesService: StripeInterfacesService
    ) {
        super();
    }

    @Get('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async fetch(@User() user: UserDto): Promise<PaymentStripeFetchInterfaceResponseDto> {

        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError
        );

        return {
            stripe_interface: stripeInterface
        }
    }


    @Post('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async createStripeInterface(@Body() body: PaymentStripeCreateStripeInterfaceInputDto, @User() user: UserDto): Promise<PaymentStripeCreateStripeInterfaceResponseDto> {

        const connectAccount = await this._serviceCall(
            this.stripeInterfacesService.createAccount(user, body.account_token),
            StatusCodes.InternalServerError
        );

        const updatedInterface = await this._serviceCall(
            this.stripeInterfacesService.bindAccountToUserInterface(user, connectAccount),
            StatusCodes.InternalServerError
        );

        return {
            stripe_interface: updatedInterface
        }
    }

    @Post('/external-account')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async addExternalBankAccount(@Body() body: PaymentStripeAddExternalAccountInputDto, @User() user: UserDto): Promise<PaymentStripeAddExternalAccountResponseDto> {

        const stripeInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError
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
            StatusCodes.InternalServerError
        );

        return {
            stripe_interface: updatedStripeInterface
        }

    }

}
