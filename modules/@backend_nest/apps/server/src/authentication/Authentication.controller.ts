import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    Injectable,
    Post,
    Request,
    Response,
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
import { EmailValidationInputDto } from '@app/server/authentication/dto/EmailValidationInput.dto';
import { EmailValidationResponseDto } from '@app/server/authentication/dto/EmailValidationResponse.dto';
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
import { EmailService } from '@lib/common/email/Email.service';
import { b64Encode } from '@common/global';
import { GoogleLoginResponseDto } from '@app/server/authentication/dto/GoogleLoginResponse.dto';

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
     * @param emailService
     * @param configService
     */
    constructor /* instanbul ignore next */(
        private readonly authenticationService: AuthenticationService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Authenticate a user by verifying its google id_token
     *
     * @param req
     */
    @Post('/google/login')
    @UseGuards(AuthGuard('google'))
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError])
    async googleLogin(@Request() req): Promise<GoogleLoginResponseDto> {
        try {
            delete req.user.current_purchase;
            delete req.user.past_purchases;
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
            delete req.user.current_purchase;
            delete req.user.past_purchases;
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
     * Helper to send mail for account creation
     *
     * @param user
     * @param redirectUrl
     */
    async sendAccountCreationMail(user: PasswordlessUserDto, redirectUrl: string): Promise<void> {
        const data = {
            email: user.email,
            locale: user.locale,
            username: user.username,
            id: user.id,
            redirectUrl,
        };

        const signature = await this.jwtService.signAsync(data, {
            expiresIn: '1 day',
        });

        const validationLink = `${redirectUrl}?token=${encodeURIComponent(b64Encode(signature))}`;

        const emailResp = await this.emailService.send({
            template: 'validate',
            to: data.email,
            locale: data.locale,
            locals: {
                validationLink,
                token: signature,
            },
        });

        if (emailResp.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'mail_error',
                },
                StatusCodes.InternalServerError,
            );
        }
    }

    /**
     * Helper to send mail for password reset
     * @param user
     * @param redirectUrl
     */
    async sendPasswordResetMail(user: PasswordlessUserDto, redirectUrl: string): Promise<void> {
        const data = {
            email: user.email,
            locale: user.locale,
            id: user.id,
            redirectUrl,
        };

        const signature = await this.jwtService.signAsync(data, {
            expiresIn: '1 day',
        });

        const validationLink = `${redirectUrl}?token=${encodeURIComponent(b64Encode(signature))}`;

        const emailResp = await this.emailService.send({
            template: 'resetPassword',
            to: data.email,
            locale: data.locale,
            locals: {
                validationLink,
                token: signature,
            },
        });

        if (emailResp.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'mail_error',
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
            await this.sendAccountCreationMail(user, body.redirectUrl || this.configService.get('VALIDATION_URL'));
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
            await this.sendAccountCreationMail(
                resp.response,
                body.redirectUrl || this.configService.get('VALIDATION_URL'),
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
            await this.sendPasswordResetMail(
                resp.response,
                body.redirectUrl || this.configService.get('RESET_PASSWORD_URL'),
            );
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
        return {};
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
        delete (validatedUserRes.response as any).current_purchase;
        delete (validatedUserRes.response as any).past_purchases;
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
            delete (resp.response as any).current_purchase;
            delete (resp.response as any).past_purchases;
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

        delete (validatedUserRes.response as any).current_purchase;
        delete (validatedUserRes.response as any).past_purchases;

        return {
            user: validatedUserRes.response,
        };
    }
}
