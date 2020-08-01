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
import { ResetPasswordTaskDto } from '@app/server/authentication/dto/ResetPasswordTask.dto';
import { ValidateResetPasswordResponseDto } from '@app/server/authentication/dto/ValidateResetPasswordResponse.dto';
import { ValidateResetPasswordInputDto } from '@app/server/authentication/dto/ValidateResetPasswordInput.dto';
import { ResetPasswordResponseDto } from '@app/server/authentication/dto/ResetPasswordResponse.dto';
import { ResetPasswordInputDto } from '@app/server/authentication/dto/ResetPasswordInputDto';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { UserTypes, UserTypesGuard } from '@app/server/authentication/guards/UserTypesGuard.guard';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { PasswordChangeDto } from '@app/server/authentication/dto/PasswordChange.dto';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import parse from 'parse-duration';
import { ResendValidationResponseDto } from '@app/server/authentication/dto/ResendValidationResponse.dto';
import { ResendValidationInputDto } from '@app/server/authentication/dto/ResendValidationInput.dto';

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
                expiration: new Date(Date.now() + parse(this.configService.get('JWT_EXPIRATION'))),
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
                expiration: new Date(Date.now() + parse(this.configService.get('JWT_EXPIRATION'))),
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
     *
     * [POST /authentication/resend-validation] : Generates a new validation email
     */
    @Post('/resend-validation')
    @UseGuards(AuthGuard('jwt'))
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError, StatusCodes.Unauthorized])
    async resendValidation(
        @Body() body: ResendValidationInputDto,
        @User() user: UserDto,
    ): Promise<ResendValidationResponseDto> {
        if (!user.valid) {
            await this.mailingQueue.add(
                '@@mailing/validationEmail',
                {
                    email: user.email,
                    username: user.username,
                    locale: user.locale,
                    id: user.id,
                    redirectUrl: body.redirectUrl || this.configService.get('VALIDATION_URL'),
                } as EmailValidationTaskDto,
                {
                    attempts: 5,
                    backoff: 5000,
                },
            );
        }

        return {};
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
                    redirectUrl: body.redirectUrl || this.configService.get('VALIDATION_URL'),
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
                expiration: new Date(Date.now() + parse(this.configService.get('JWT_EXPIRATION'))),
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
                    redirectUrl: body.redirectUrl || this.configService.get('VALIDATION_URL'),
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
                expiration: new Date(Date.now() + parse(this.configService.get('JWT_EXPIRATION'))),
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
    async resetPassword(@Body() body: ResetPasswordInputDto): Promise<ResetPasswordResponseDto> {
        const resp = await this.authenticationService.getUserIfEmailExists(body.email);
        if (resp.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: resp.error,
                },
                StatusCodes.InternalServerError,
            );
        } else if (resp.response !== null) {
            await this.mailingQueue.add(
                '@@mailing/resetPasswordEmail',
                {
                    id: resp.response.id,
                    email: resp.response.email,
                    locale: resp.response.locale,
                    redirectUrl: body.redirectUrl || this.configService.get('RESET_PASSWORD_URL'),
                } as ResetPasswordTaskDto,
                {
                    attempts: 5,
                    backoff: 5000,
                },
            );
        }
        return {
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

    /**
     * [POST /authentication/validate/pasword/reset] : Validates a password reset
     */
    @Post('/validate/password/reset')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async validateResetPassword(
        @Body() body: ValidateResetPasswordInputDto,
    ): Promise<ValidateResetPasswordResponseDto> {
        let validatedUserRes: ServiceResponse<PasswordlessUserDto>;
        try {
            const payload = await this.jwtService.verifyAsync<ResetPasswordTaskDto>(body.token);
            validatedUserRes = await this.authenticationService.validateResetPassword(payload.id, body.password);
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

        if (validatedUserRes.error === 'password_should_be_keccak256') {
            throw new HttpException(
                {
                    status: StatusCodes.UnprocessableEntity,
                    message: validatedUserRes.error,
                },
                StatusCodes.UnprocessableEntity,
            );
        } else if (validatedUserRes.error) {
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

    /**
     * [POST /authentication/local/password/update] : Updates user's password
     */
    @Post('local/password/update')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([
        StatusCodes.OK,
        StatusCodes.Unauthorized,
        StatusCodes.UnprocessableEntity,
        StatusCodes.InternalServerError,
    ])
    @UseGuards(AuthGuard('jwt'), RolesGuard, UserTypesGuard, ValidGuard)
    @Roles('authenticated')
    @UserTypes('t721')
    async updatePassword(@Body() body: PasswordChangeDto, @User() user: UserDto): Promise<PasswordlessUserDto> {
        const resp = await this.authenticationService.updateUserPassword(user.email, body.password);
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
            return resp.response;
        }
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

                case 'invalid signature': {
                    throw new HttpException(
                        {
                            status: StatusCodes.Unauthorized,
                            message: 'invalid_signature',
                        },
                        StatusCodes.Unauthorized,
                    );
                }

                default: {
                    throw new HttpException(
                        {
                            status: StatusCodes.InternalServerError,
                            message: e.message,
                        },
                        StatusCodes.InternalServerError,
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
