import {
    Body,
    Controller,
    HttpException,
    Injectable,
    Post,
    UseFilters,
    UseGuards,
    Request, Get,
} from '@nestjs/common';
import { AuthenticationService }    from './Authentication.service';
import { ApiResponse }              from '@nestjs/swagger';
import { StatusCodes, StatusNames } from '../../utils/codes';
import { PasswordlessUserDto }      from './dto/PasswordlessUser.dto';
import { HttpExceptionFilter }      from '../../utils/HttpException.filter';
import { LocalRegisterResponseDto } from './dto/LocalRegisterResponse.dto';
import { ServiceResponse }          from '../../utils/ServiceResponse';
import { LocalRegisterInputDto }    from './dto/LocalRegisterInput.dto';
import { JwtService }               from '@nestjs/jwt';
import { AuthGuard }                from '@nestjs/passport';
import { LocalLoginResponseDto } from './dto/LocalLoginResponse.dto';
import { Roles, RolesGuard }     from './guards/RolesGuard.guard';

/**
 * Controller exposing the authentication routes
 */
@Injectable()
@Controller('authentication')
export class AuthenticationController {

    /**
     * Dependency Injection
     *
     * @param authenticationService
     * @param jwtService
     */
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly jwtService: JwtService
    ) {
    }

    /**
     * [POST /authentication/local/login] : Login with local account
     */
    @Roles('authenticated', 'admin')
    @Get('/me')
    @ApiResponse({ status: StatusCodes.OK, description: StatusNames[StatusCodes.OK] })
    @ApiResponse({ status: StatusCodes.Unauthorized, description: StatusNames[StatusCodes.Unauthorized] })
    @ApiResponse({ status: StatusCodes.InternalServerError, description: StatusNames[StatusCodes.InternalServerError] })
    @UseFilters(new HttpExceptionFilter())
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async testGetAccount(@Request() req): Promise<LocalLoginResponseDto> {
        return req.user
    }

    /**
     * [POST /authentication/local/login] : Login with local account
     */
    @UseGuards(AuthGuard('local'))
    @Post('/local/login')
    @ApiResponse({ status: StatusCodes.OK, description: StatusNames[StatusCodes.OK] })
    @ApiResponse({ status: StatusCodes.Unauthorized, description: StatusNames[StatusCodes.Unauthorized] })
    @ApiResponse({ status: StatusCodes.InternalServerError, description: StatusNames[StatusCodes.InternalServerError] })
    @UseFilters(new HttpExceptionFilter())
    async localLogin(@Request() req): Promise<LocalLoginResponseDto> {
        return {
            user: req.user,
            token: this.jwtService.sign({
                username: req.user.username,
                sub: req.user.id
            })
        };
    }

    /**
     * [POST /authentication/local/register] : Create a new local account
     */
    @Post('/local/register')
    @ApiResponse({ status: StatusCodes.Created, description: StatusNames[StatusCodes.Created] })
    @ApiResponse({ status: StatusCodes.Conflict, description: StatusNames[StatusCodes.Conflict] })
    @ApiResponse({ status: StatusCodes.UnprocessableEntity, description: StatusNames[StatusCodes.UnprocessableEntity] })
    @ApiResponse({ status: StatusCodes.InternalServerError, description: StatusNames[StatusCodes.InternalServerError] })
    @UseFilters(new HttpExceptionFilter())
    async localRegister(@Body() body: LocalRegisterInputDto): Promise<LocalRegisterResponseDto> {
        const resp: ServiceResponse<PasswordlessUserDto> = await this.authenticationService.createT721User(body.email, body.password, body.username, body.wallet);
        if (resp.error) {

            switch (resp.error) {
                case 'email_already_in_use':
                case 'username_already_in_use':
                case 'address_already_in_use':
                    throw new HttpException({
                        status: StatusCodes.Conflict,
                        message: resp.error,
                    }, StatusCodes.Conflict);

                case 'invalid_wallet_format':
                case 'password_should_be_keccak256':
                    throw new HttpException({
                        status: StatusCodes.UnprocessableEntity,
                        message: resp.error,
                    }, StatusCodes.UnprocessableEntity);

                default:
                    throw new HttpException({
                        status: StatusCodes.InternalServerError,
                        message: resp.error,
                    }, StatusCodes.InternalServerError);
            }


        } else {

            return {
                user: resp.response,
                token: this.jwtService.sign({
                    username: resp.response.username,
                    sub: resp.response.id
                }),
            };
        }
    }

}
