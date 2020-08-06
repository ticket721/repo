import { Controller, Get, HttpCode, Injectable, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags }                                       from '@nestjs/swagger';
import { ControllerBasics }                                             from '@lib/common/utils/ControllerBasics.base';
import { AuthGuard }                                                    from '@nestjs/passport';
import { Roles, RolesGuard }                                            from '@app/server/authentication/guards/RolesGuard.guard';
import { ValidGuard }                                                   from '@app/server/authentication/guards/ValidGuard.guard';
import { HttpExceptionFilter }                                          from '@app/server/utils/HttpException.filter';
import { StatusCodes }                                                  from '@lib/common/utils/codes.value';
import { ApiResponses }                                                 from '@app/server/utils/ApiResponses.controller.decorator';
import { User }                                                         from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto }                                                      from '@lib/common/users/dto/User.dto';
import { StripeInterfacesService }                                      from '@lib/common/stripeinterface/StripeInterfaces.service';
import { PaymentStripeFetchInterfaceResponseDto }                       from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
import { StripeInterfaceEntity }                                        from '@lib/common/stripeinterface/entities/StripeInterface.entity';

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
}
