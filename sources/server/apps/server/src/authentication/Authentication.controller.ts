import {
    Body,
    Controller,
    HttpException,
    Injectable,
    Post,
    UseFilters,
    UseGuards,
    Request, Get, Response, HttpCode,
} from '@nestjs/common';
import { AuthenticationService }    from './Authentication.service';
import { ApiResponse }              from '@nestjs/swagger';
import { PasswordlessUserDto }      from './dto/PasswordlessUser.dto';
import { LocalRegisterResponseDto } from './dto/LocalRegisterResponse.dto';
import { LocalRegisterInputDto }    from './dto/LocalRegisterInput.dto';
import { JwtService }               from '@nestjs/jwt';
import { AuthGuard }                from '@nestjs/passport';
import { LocalLoginResponseDto }    from './dto/LocalLoginResponse.dto';
import { Roles, RolesGuard }        from './guards/RolesGuard.guard';
import { StatusCodes, StatusNames } from '../utils/codes';
import { HttpExceptionFilter }      from '../utils/HttpException.filter';
import { ServiceResponse }          from '../utils/ServiceResponse';
import { Web3RegisterInputDto }     from '@app/server/authentication/dto/Web3RegisterInput.dto';
import { Web3RegisterResponseDto }  from '@app/server/authentication/dto/Web3RegisterResponse.dto';
import { Web3LoginResponseDto }     from '@app/server/authentication/dto/Web3LoginResponse.dto';

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
    constructor /* instanbul ignore next */ (
        private readonly authenticationService: AuthenticationService,
        private readonly jwtService: JwtService
    ) {
    }

    /**
     * [POST /authentication/web3/login] : Login with web3 account
     */
    @UseGuards(AuthGuard('web3'))
    @Post('/web3/login')
    @HttpCode(200)
    @ApiResponse({ status: StatusCodes.OK, description: StatusNames[StatusCodes.OK] })
    @ApiResponse({ status: StatusCodes.Unauthorized, description: StatusNames[StatusCodes.Unauthorized] })
    @ApiResponse({ status: StatusCodes.InternalServerError, description: StatusNames[StatusCodes.InternalServerError] })
    @UseFilters(new HttpExceptionFilter())
    /* istanbul ignore next */
    async web3Login(@Request() req): Promise<Web3LoginResponseDto> {
        return {
            user: req.user,
            token: this.jwtService.sign({
                username: req.user.username,
                sub: req.user.id
            })
        };
    }

    /**
     * [POST /authentication/local/login] : Login with local account
     */
    @UseGuards(AuthGuard('local'))
    @Post('/local/login')
    @HttpCode(200)
    @ApiResponse({ status: StatusCodes.OK, description: StatusNames[StatusCodes.OK] })
    @ApiResponse({ status: StatusCodes.Unauthorized, description: StatusNames[StatusCodes.Unauthorized] })
    @ApiResponse({ status: StatusCodes.InternalServerError, description: StatusNames[StatusCodes.InternalServerError] })
    @UseFilters(new HttpExceptionFilter())
    /* istanbul ignore next */
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

    /**
     * [POST /authentication/web3/register] : Create a new web3 account
     */
    @Post('/web3/register')
    @ApiResponse({ status: StatusCodes.Created, description: StatusNames[StatusCodes.Created] })
    @ApiResponse({ status: StatusCodes.Conflict, description: StatusNames[StatusCodes.Conflict] })
    @ApiResponse({ status: StatusCodes.Unauthorized, description: StatusNames[StatusCodes.Unauthorized] })
    @ApiResponse({ status: StatusCodes.UnprocessableEntity, description: StatusNames[StatusCodes.UnprocessableEntity] })
    @ApiResponse({ status: StatusCodes.InternalServerError, description: StatusNames[StatusCodes.InternalServerError] })
    @UseFilters(new HttpExceptionFilter())
    async web3Register(@Body() body: Web3RegisterInputDto): Promise<Web3RegisterResponseDto> {
        const resp: ServiceResponse<PasswordlessUserDto> = await this.authenticationService.createWeb3User(body.email, body.username, body.timestamp, body.address, body.signature);
        if (resp.error) {

            switch (resp.error) {
                case 'email_already_in_use':
                case 'username_already_in_use':
                case 'address_already_in_use':
                    throw new HttpException({
                        status: StatusCodes.Conflict,
                        message: resp.error,
                    }, StatusCodes.Conflict);

                case 'invalid_signature':
                case 'signature_timed_out':
                case 'signature_is_in_the_future':
                    throw new HttpException({
                        status: StatusCodes.Unauthorized,
                        message: resp.error,
                    }, StatusCodes.Unauthorized);

                case 'signature_check_fail':
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
