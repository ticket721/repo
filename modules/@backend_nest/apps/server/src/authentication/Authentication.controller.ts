import {
    Body,
    Controller,
    HttpCode,
    HttpException,
    Injectable,
    Post,
    Request,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './Authentication.service';
import { ApiTags } from '@nestjs/swagger';
import { PasswordlessUserDto } from './dto/PasswordlessUser.dto';
import { LocalRegisterResponseDto } from './dto/LocalRegisterResponse.dto';
import { LocalRegisterInputDto } from './dto/LocalRegisterInput.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { LocalLoginResponseDto } from './dto/LocalLoginResponse.dto';
import { HttpExceptionFilter } from '../utils/HttpException.filter';
import { Web3RegisterInputDto } from '@app/server/authentication/dto/Web3RegisterInput.dto';
import { Web3RegisterResponseDto } from '@app/server/authentication/dto/Web3RegisterResponse.dto';
import { Web3LoginResponseDto } from '@app/server/authentication/dto/Web3LoginResponse.dto';
import { EmailValidationInputDto } from '@app/server/authentication/dto/EmailValidationInput.dto';
import { EmailValidationResponseDto } from '@app/server/authentication/dto/EmailValidationResponse.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailValidationTaskDto } from '@app/server/authentication/dto/EmailValidationTask.dto';
import { ConfigService } from '@lib/common/config/Config.service';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { EmailResetPasswordTaskDto } from '@app/server/authentication/dto/EmailResetPasswordTask.dto';
import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * Controller exposing the authentication routes
 */
@Injectable()
@ApiTags('auth')
@Controller('authentication')
export class AuthenticationController {
    /**
     * Dependency Injection
     *
     * @param authenticationService
     * @param jwtService
     * @param mailingQueue
     * @param configService
     */
    constructor /* instanbul ignore next */(
        private readonly authenticationService: AuthenticationService,
        private readonly jwtService: JwtService,
        @InjectQueue('mailing') private readonly mailingQueue: Queue,
        private readonly configService: ConfigService,
    ) {}

    /**
     * [POST /authentication/web3/login] : Login with web3 account
     */
    @Post('/web3/login')
    @UseGuards(AuthGuard('web3'))
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError])
    /* istanbul ignore next */
    async web3Login(@Request() req): Promise<Web3LoginResponseDto> {
        try {
            return {
                user: req.user,
                token: this.jwtService.sign({
                    username: req.user.username,
                    sub: req.user.id,
                }),
            };
        } catch (e) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'token_signature_error',
                },
                StatusCodes.InternalServerError,
            );
        }
    }

    /**
     * [POST /authentication/local/login] : Login with local account
     */
    @Post('/local/login')
    @UseGuards(AuthGuard('local'))
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError])
    /* istanbul ignore next */
    async localLogin(@Request() req): Promise<LocalLoginResponseDto> {
        try {
            return {
                user: req.user,
                token: this.jwtService.sign({
                    username: req.user.username,
                    sub: req.user.id,
                }),
            };
        } catch (e) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'token_signature_error',
                },
                StatusCodes.InternalServerError,
            );
        }
    }

    /**
     * [POST /authentication/local/register] : Create a new local account
     */
    @Post('/local/register')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Conflict,
        StatusCodes.UnprocessableEntity,
        StatusCodes.InternalServerError,
    ])
    async localRegister(@Body() body: LocalRegisterInputDto): Promise<LocalRegisterResponseDto> {
        const resp: ServiceResponse<PasswordlessUserDto> = await this.authenticationService.createT721User(
            body.email,
            body.password,
            body.username,
            body.locale || 'en',
        );
        if (resp.error) {
            switch (resp.error) {
                case 'email_already_in_use':
                case 'username_already_in_use':
                case 'address_already_in_use':
                    throw new HttpException(
                        {
                            status: StatusCodes.Conflict,
                            message: resp.error,
                        },
                        StatusCodes.Conflict,
                    );

                case 'password_should_be_keccak256':
                    throw new HttpException(
                        {
                            status: StatusCodes.UnprocessableEntity,
                            message: resp.error,
                        },
                        StatusCodes.UnprocessableEntity,
                    );

                default:
                    throw new HttpException(
                        {
                            status: StatusCodes.InternalServerError,
                            message: resp.error,
                        },
                        StatusCodes.InternalServerError,
                    );
            }
        } else {
            await this.mailingQueue.add(
                '@@mailing/validationEmail',
                {
                    email: resp.response.email,
                    username: resp.response.username,
                    locale: resp.response.locale,
                    id: resp.response.id,
                } as EmailValidationTaskDto,
                {
                    attempts: 5,
                    backoff: 5000,
                },
            );

            return {
                user: resp.response,
                token: this.jwtService.sign({
                    username: resp.response.username,
                    sub: resp.response.id,
                }),
                validationToken:
                    this.configService.get('NODE_ENV') === 'development'
                        ? this.jwtService.sign(
                              {
                                  email: resp.response.email,
                                  username: resp.response.username,
                                  locale: resp.response.locale,
                                  id: resp.response.id,
                              },
                              {
                                  expiresIn: '1 day',
                              },
                          )
                        : undefined,
            };
        }
    }

    /**
     * [POST /authentication/web3/register] : Create a new web3 account
     */
    @Post('/web3/register')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Conflict,
        StatusCodes.Unauthorized,
        StatusCodes.UnprocessableEntity,
        StatusCodes.InternalServerError,
    ])
    async web3Register(@Body() body: Web3RegisterInputDto): Promise<Web3RegisterResponseDto> {
        const resp: ServiceResponse<PasswordlessUserDto> = await this.authenticationService.createWeb3User(
            body.email,
            body.username,
            body.timestamp,
            body.address,
            body.signature,
            body.locale || 'en',
        );
        if (resp.error) {
            switch (resp.error) {
                case 'email_already_in_use':
                case 'username_already_in_use':
                case 'address_already_in_use':
                    throw new HttpException(
                        {
                            status: StatusCodes.Conflict,
                            message: resp.error,
                        },
                        StatusCodes.Conflict,
                    );

                case 'invalid_signature':
                case 'signature_timed_out':
                case 'signature_is_in_the_future':
                    throw new HttpException(
                        {
                            status: StatusCodes.Unauthorized,
                            message: resp.error,
                        },
                        StatusCodes.Unauthorized,
                    );

                case 'signature_check_fail':
                    throw new HttpException(
                        {
                            status: StatusCodes.UnprocessableEntity,
                            message: resp.error,
                        },
                        StatusCodes.UnprocessableEntity,
                    );

                default:
                    throw new HttpException(
                        {
                            status: StatusCodes.InternalServerError,
                            message: resp.error,
                        },
                        StatusCodes.InternalServerError,
                    );
            }
        } else {
            await this.mailingQueue.add(
                '@@mailing/validationEmail',
                {
                    email: resp.response.email,
                    username: resp.response.username,
                    locale: resp.response.locale,
                    id: resp.response.id,
                } as EmailValidationTaskDto,
                {
                    attempts: 5,
                    backoff: 5000,
                },
            );

            return {
                user: resp.response,
                token: this.jwtService.sign({
                    username: resp.response.username,
                    sub: resp.response.id,
                }),
                validationToken:
                    this.configService.get('NODE_ENV') === 'development'
                        ? this.jwtService.sign(
                              {
                                  email: resp.response.email,
                                  username: resp.response.username,
                                  locale: resp.response.locale,
                                  id: resp.response.id,
                              },
                              {
                                  expiresIn: '1 day',
                              },
                          )
                        : undefined,
            };
        }
    }

    /**
     * [POST /authentication/local/password/update] : Updates user's password
     */
    @Post('local/password/reset')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([
        StatusCodes.OK,
        StatusCodes.Unauthorized,
        StatusCodes.UnprocessableEntity,
        StatusCodes.InternalServerError,
    ])
    async resetPassword(@Body() body: Partial<UserDto>): Promise<PasswordlessUserDto> {
        const resp = await this.authenticationService.resetUserPassword(body.email, body.username);
        if (resp.error) {
            switch (resp.error) {
                case 'user_not_found':
                    throw new HttpException(
                        {
                            status: StatusCodes.Unauthorized,
                            message: resp.error,
                        },
                        StatusCodes.Unauthorized,
                    );
                default:
                    throw new HttpException(
                        {
                            status: StatusCodes.InternalServerError,
                            message: resp.error,
                        },
                        StatusCodes.InternalServerError,
                    );
            }
        } else {
            await this.mailingQueue.add(
                '@@mailing/resetPasswordEmail',
                {
                    email: resp.response.email,
                    username: resp.response.username,
                    locale: resp.response.locale,
                    id: resp.response.id,
                } as EmailResetPasswordTaskDto,
                {
                    attempts: 5,
                    backoff: 5000,
                },
            );
        }
        return resp.response;
    }

    /**
     * [POST /authentication/validate] : Validates a user's email address
     */
    @Post('/validate')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async validateEmail(@Body() body: EmailValidationInputDto): Promise<EmailValidationResponseDto> {
        let validatedUserRes: ServiceResponse<PasswordlessUserDto>;
        try {
            const payload = await this.jwtService.verifyAsync<EmailValidationTaskDto>(body.token);
            validatedUserRes = await this.authenticationService.validateUserEmail(payload.id);
        } catch (e) {
            switch (e.message) {
                case 'jwt expired': {
                    throw new HttpException(
                        {
                            status: StatusCodes.Unauthorized,
                            message: 'jwt_expired',
                        },
                        StatusCodes.Unauthorized,
                    );
                }

                default:
                case 'invalid signature': {
                    throw new HttpException(
                        {
                            status: StatusCodes.Unauthorized,
                            message: 'invalid_signature',
                        },
                        StatusCodes.Unauthorized,
                    );
                }
            }
        }

        if (validatedUserRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: validatedUserRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            user: validatedUserRes.response,
        };
    }
}
