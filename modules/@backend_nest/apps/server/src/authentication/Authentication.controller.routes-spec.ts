import { StatusCodes } from '@lib/common/utils/codes.value';
import { AxiosResponse } from 'axios';
import { LocalRegisterResponseDto } from '@app/server/authentication/dto/LocalRegisterResponse.dto';
import { LocalLoginResponseDto } from '@app/server/authentication/dto/LocalLoginResponse.dto';
import { EmailValidationResponseDto } from '@app/server/authentication/dto/EmailValidationResponse.dto';
import {
    failWithCode,
    generateEmail,
    generatePassword,
    generateUserName,
    getSDK,
    getSDKAndUser,
} from '../../test/utils';
import { PasswordlessUserDto } from './dto/PasswordlessUser.dto';
import { FailedRegisterReport, T721SDK } from '@common/sdk';
import { ValidateResetPasswordResponseDto } from '@app/server/authentication/dto/ValidateResetPasswordResponse.dto';
import { ResetPasswordResponseDto } from '@app/server/authentication/dto/ResetPasswordResponse.dto';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('localRegister (POST /local/register)', function() {
            test('should create a new t721 account', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                const response: AxiosResponse<LocalRegisterResponseDto> = (await sdk.localRegister(
                    user.email,
                    user.password,
                    user.username,
                )) as AxiosResponse<LocalRegisterResponseDto>;

                expect(response.data).toEqual({
                    token: response.data.token,
                    user: {
                        address: response.data.user.address,
                        device_address: null,
                        email: user.email,
                        id: response.data.user.id,
                        locale: 'en',
                        role: 'authenticated',
                        type: 't721',
                        username: user.username,
                        valid: false,
                        admin: false,
                    },
                    expiration: expect.anything(),
                    validationToken: response.data.validationToken,
                } as LocalRegisterResponseDto);
            });

            test('should create a new t721 account with fr locale', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                const response: AxiosResponse<LocalRegisterResponseDto> = (await sdk.localRegister(
                    user.email,
                    user.password,
                    user.username,
                    'fr',
                )) as AxiosResponse<LocalRegisterResponseDto>;

                expect(response.data).toEqual({
                    token: response.data.token,
                    user: {
                        address: response.data.user.address,
                        device_address: null,
                        email: user.email,
                        id: response.data.user.id,
                        locale: 'fr',
                        role: 'authenticated',
                        type: 't721',
                        username: user.username,
                        valid: false,
                        admin: false,
                    },
                    expiration: expect.anything(),
                    validationToken: response.data.validationToken,
                } as LocalRegisterResponseDto);
            });

            test('should fail creating a new t721 account for invalid arguments', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: [],
                    username: generateUserName(),
                    password: generatePassword(),
                };

                await failWithCode(
                    sdk.localRegister(user.email as any, user.password, user.username),
                    StatusCodes.BadRequest,
                );
            });

            test('should fail creating a new t721 account for email conflict', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                await sdk.localRegister(user.email, user.password, user.username);

                await failWithCode(
                    sdk.localRegister(user.email, generatePassword(), generateUserName()),
                    StatusCodes.Conflict,
                );
            });

            test('should fail creating a new t721 account for username conflict', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                await sdk.localRegister(user.email, user.password, user.username);

                await failWithCode(
                    sdk.localRegister(generateEmail(), generatePassword(), user.username),
                    StatusCodes.Conflict,
                );
            });

            test('should fail creating a new t721 account for invalid password format', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: `${generatePassword()}${generatePassword()}`,
                };

                await failWithCode(
                    sdk.post(
                        '/authentication/local/register',
                        {
                            'Content-Type': 'application/json',
                        },
                        user,
                    ),
                    StatusCodes.UnprocessableEntity,
                );
            });
        });

        describe('localLogin (POST /local/login)', function() {
            test('should login properly on created & validated account', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                const response: AxiosResponse<LocalRegisterResponseDto> = (await sdk.localRegister(
                    user.email,
                    user.password,
                    user.username,
                )) as AxiosResponse<LocalRegisterResponseDto>;

                await sdk.validateEmail(response.data.validationToken);

                const loginResponse: AxiosResponse<LocalLoginResponseDto> = await sdk.localLogin(
                    user.email,
                    user.password,
                );

                expect(loginResponse.data).toEqual({
                    user: {
                        valid: true,
                        address: loginResponse.data.user.address,
                        role: 'authenticated',
                        id: loginResponse.data.user.id,
                        locale: 'en',
                        type: 't721',
                        email: loginResponse.data.user.email,
                        username: loginResponse.data.user.username,
                        admin: false,
                    },
                    expiration: expect.anything(),
                    token: loginResponse.data.token,
                } as LocalLoginResponseDto);
            });

            test('should fail login on invalid password', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                const response: AxiosResponse<LocalRegisterResponseDto> = (await sdk.localRegister(
                    user.email,
                    user.password,
                    user.username,
                )) as AxiosResponse<LocalRegisterResponseDto>;

                await sdk.validateEmail(response.data.validationToken);

                await failWithCode(sdk.localLogin(user.email, user.username), StatusCodes.Unauthorized);
            });

            test('should fail login on unknown user', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                await failWithCode(sdk.localLogin(user.email, user.username), StatusCodes.Unauthorized);
            });
        });

        describe('validateEmail (POST /validate)', function() {
            test('should validate created account', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                const response: AxiosResponse<LocalRegisterResponseDto> = (await sdk.localRegister(
                    user.email,
                    user.password,
                    user.username,
                )) as AxiosResponse<LocalRegisterResponseDto>;

                const validationResponse: AxiosResponse<EmailValidationResponseDto> = await sdk.validateEmail(
                    response.data.validationToken,
                );

                expect(validationResponse.data).toEqual({
                    user: {
                        valid: true,
                        address: validationResponse.data.user.address,
                        device_address: null,
                        role: 'authenticated',
                        id: validationResponse.data.user.id,
                        locale: 'en',
                        type: 't721',
                        email: validationResponse.data.user.email,
                        username: validationResponse.data.user.username,
                        admin: false,
                    },
                } as EmailValidationResponseDto);
            });

            test('should fail validating', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: generatePassword(),
                };

                await failWithCode(sdk.validateEmail(user.email), StatusCodes.InternalServerError, 'jwt malformed');
            });
        });

        describe('changePassword (POST local/password/update)', function() {
            test('should change password', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const pass = generatePassword();

                const res: AxiosResponse<PasswordlessUserDto> = (await sdk.updatePassword(
                    token,
                    pass,
                )) as AxiosResponse<PasswordlessUserDto>;

                expect(res.data).toEqual({
                    id: expect.anything(),
                    email: user.email,
                    username: expect.anything(),
                    device_address: null,
                    address: expect.anything(),
                    type: 't721',
                    role: 'authenticated',
                    valid: expect.anything(),
                    locale: expect.anything(),
                    admin: false,
                });

                const loginResponse: AxiosResponse<LocalLoginResponseDto> = await sdk.localLogin(user.email, pass);

                expect(loginResponse.data).toEqual({
                    user: {
                        valid: true,
                        address: loginResponse.data.user.address,
                        role: 'authenticated',
                        id: loginResponse.data.user.id,
                        locale: 'en',
                        type: 't721',
                        email: loginResponse.data.user.email,
                        username: loginResponse.data.user.username,
                        admin: false,
                    },
                    expiration: expect.anything(),
                    token: loginResponse.data.token,
                } as LocalLoginResponseDto);
            });

            test('should fail unauthorizes (POST local/password/update)', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    password: generatePassword(),
                };

                await failWithCode(sdk.updatePassword('badToken', user.password), StatusCodes.Unauthorized);
            });

            test('should fail bad email', async function() {
                const sdk = await getSDK(getCtx);

                const user = {
                    email: generateEmail(),
                    username: generateUserName(),
                    password: 'password',
                };

                await failWithCode(
                    sdk.post(
                        '/authentication/local/password/update',
                        {
                            'Content-Type': 'application/json',
                        },
                        user,
                    ),
                    StatusCodes.Unauthorized,
                );
            });
        });

        describe('resetPassword (POST /validate/password/reset', function() {
            test('should fail not existing user', async function() {
                const sdk = await getSDK(getCtx);

                const pass = generatePassword();

                await failWithCode(sdk.validateResetPassword('badToken', pass), StatusCodes.Unauthorized);
            });

            test('should fail weak password', async function() {
                const sdk = await getSDK(getCtx);

                const pass = '';

                const res: FailedRegisterReport = (await sdk.validateResetPassword(
                    'token',
                    pass,
                )) as FailedRegisterReport;

                expect(res.report_status).toBe('weak');
            });

            test('should reset password', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const pass = generatePassword();

                const response: AxiosResponse<ResetPasswordResponseDto> = await sdk.resetPassword(user.email);

                const res = (await sdk.validateResetPassword(response.data.validationToken, pass)) as AxiosResponse<
                    ValidateResetPasswordResponseDto
                >;

                expect(res.data.user).toEqual(user);

                const loginResponse: AxiosResponse<LocalLoginResponseDto> = await sdk.localLogin(user.email, pass);

                expect(loginResponse.data).toEqual({
                    user: {
                        valid: true,
                        address: loginResponse.data.user.address,
                        role: 'authenticated',
                        id: loginResponse.data.user.id,
                        locale: 'en',
                        type: 't721',
                        email: loginResponse.data.user.email,
                        username: loginResponse.data.user.username,
                        admin: false,
                    },
                    expiration: expect.anything(),
                    token: loginResponse.data.token,
                } as LocalLoginResponseDto);
            });
        });
    };
}
