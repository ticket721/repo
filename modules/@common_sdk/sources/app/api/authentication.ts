import {
    keccak256,
    toAcceptedKeccak256Format,
    getPasswordStrength,
    PasswordStrengthReport,
    Web3RegisterSigner,
    Web3LoginSigner,
}                                     from '@common/global';
import { T721SDK }                    from '../../index';
import { AxiosResponse }              from 'axios';
import { LocalRegisterInputDto }      from '@app/server/authentication/dto/LocalRegisterInput.dto';
import { LocalRegisterResponseDto }   from '@app/server/authentication/dto/LocalRegisterResponse.dto';
import { LocalLoginResponseDto }            from '@app/server/authentication/dto/LocalLoginResponse.dto';
import { LocalLoginInputDto }               from '@app/server/authentication/dto/LocalLoginInput.dto';
import { EIP712Payload }                    from '@ticket721/e712';
import { Web3RegisterResponseDto }          from '@app/server/authentication/dto/Web3RegisterResponse.dto';
import { Web3RegisterInputDto }             from '@app/server/authentication/dto/Web3RegisterInput.dto';
import { Web3LoginInputDto }                from '@app/server/authentication/dto/Web3LoginInput.dto';
import { EmailValidationResponseDto }       from '@app/server/authentication/dto/EmailValidationResponse.dto';
import { EmailValidationInputDto }          from '@app/server/authentication/dto/EmailValidationInput.dto';
import { UserDto }                          from '@lib/common/users/dto/User.dto';
import { ValidateResetPasswordResponseDto } from '@app/server/authentication/dto/ValidateResetPasswordResponse.dto';
import { ValidateResetPasswordInputDto }    from '@app/server/authentication/dto/ValidateResetPasswordInput.dto';
import { ResetPasswordResponseDto }         from '@app/server/authentication/dto/ResetPasswordResponse.dto';
import { PasswordChangeDto }                from '@app/server/authentication/dto/PasswordChange.dto';
import { PasswordlessUserDto }              from '@app/server/authentication/dto/PasswordlessUser.dto';
import { ResendValidationResponseDto }      from '@app/server/authentication/dto/ResendValidationResponse.dto';
import { ResendValidationInputDto }         from '@app/server/authentication/dto/ResendValidationInput.dto';
import { ResetPasswordInputDto }            from '@app/server/authentication/dto/ResetPasswordInputDto';

export interface FailedRegisterReport {
    report_status: 'weak';
    report: PasswordStrengthReport;
}

export async function localRegister(
    email: string,
    password: string,
    username: string,
    locale?: string,
    redirectUrl?: string
): Promise<AxiosResponse<LocalRegisterResponseDto> | FailedRegisterReport> {

    const self: T721SDK = this;

    const report = getPasswordStrength(password);

    if (report.score < 3) {
        return {
            report_status: 'weak',
            report,
        };
    }

    const hashed = toAcceptedKeccak256Format(keccak256(password));

    const createUser: LocalRegisterInputDto = {
        username,
        password: hashed,
        email,
        locale,
        redirectUrl
    };

    return self.post<LocalRegisterInputDto>('/authentication/local/register', {
        'Content-Type': 'application/json',
    }, createUser);
}

export async function localLogin(email: string, password: string): Promise<AxiosResponse<LocalLoginResponseDto>> {

    const self: T721SDK = this;

    const hashed = toAcceptedKeccak256Format(keccak256(password));

    const loginUser: LocalLoginInputDto = {
        password: hashed,
        email,
    };

    return self.post<LocalLoginInputDto>('/authentication/local/login', {
        'Content-Type': 'application/json',
    }, loginUser);
}

export async function web3Register(
    email: string,
    username: string,
    timestamp: number,
    address: string,
    signature: string,
    locale?: string,
    redirectUrl?: string
): Promise<AxiosResponse<Web3RegisterResponseDto>> {

    const self: T721SDK = this;

    const createWeb3User: Web3RegisterInputDto = {
        email,
        username,
        timestamp: timestamp.toString(),
        address,
        signature,
        locale,
        redirectUrl
    };

    return self.post<Web3RegisterInputDto>('/authentication/web3/register', {
        'Content-Type': 'application/json',
    }, createWeb3User);
}

export async function web3Login(timestamp: number, signature: string): Promise<AxiosResponse<Web3RegisterResponseDto>> {

    const self: T721SDK = this;

    const loginWeb3User: Web3LoginInputDto = {
        timestamp: timestamp.toString(),
        signature,
    };

    return self.post<Web3LoginInputDto>('/authentication/web3/login', {
        'Content-Type': 'application/json',
    }, loginWeb3User);
}

export function web3RegisterPayload(email: string, username: string, networkId: number): [number, EIP712Payload] {
    const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(networkId);
    return web3RegisterSigner.generateRegistrationProofPayload(email, username);
}

export function web3LoginPayload(networkId: number): [number, EIP712Payload] {
    const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(networkId);
    return web3LoginSigner.generateAuthenticationProofPayload();
}

export async function updatePassword(
    token: string,
    password: string): Promise<AxiosResponse<PasswordlessUserDto> | FailedRegisterReport> {
    const self: T721SDK = this;

    const report = getPasswordStrength(password);

    if (report.score < 3) {
        return {
            report_status: 'weak',
            report,
        };
    }

    const hashed = toAcceptedKeccak256Format(keccak256(password));

    const updateUser: PasswordChangeDto = {
        password: hashed,
    };

    return self.post<PasswordChangeDto>('/authentication/local/password/update',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }, updateUser);
}

export async function validateEmail(token: string): Promise<AxiosResponse<EmailValidationResponseDto>> {
    const self: T721SDK = this;

    const validationPayload: EmailValidationInputDto = {
        token,
    };

    return self.post<EmailValidationInputDto>('/authentication/validate', {
        'Content-Type': 'application/json',
    }, validationPayload);
}

export async function resendValidation(token: string, redirectUrl?: string) : Promise<AxiosResponse<ResendValidationResponseDto>> {
    const self: T721SDK = this;

    return await self.post<ResendValidationInputDto>('/authentication/resend-validation',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }, {
            redirectUrl
        });
}

export async function resetPassword(email: string, redirectUrl?: string) : Promise<AxiosResponse<ResetPasswordResponseDto>> {
    const self: T721SDK = this;

    return await self.post<Partial<ResetPasswordInputDto>>('/authentication/local/password/reset',
        {
            'Content-Type': 'application/json',
        }, {
            email,
            redirectUrl
        });
}

export async function validateResetPassword(
    token: string,
    password: string): Promise<AxiosResponse<ValidateResetPasswordResponseDto> | FailedRegisterReport> {
    const self: T721SDK = this;

    const report = getPasswordStrength(password);

    if (report.score < 3) {
        return {
            report_status: 'weak',
            report,
        };
    }

    const hashed = toAcceptedKeccak256Format(keccak256(password));
    const validationPayload: ValidateResetPasswordInputDto = {
        token,
        password: hashed,
    };

    return self.post<ValidateResetPasswordInputDto>('/authentication/validate/password/reset', {
        'Content-Type': 'application/json',
    }, validationPayload);
}
