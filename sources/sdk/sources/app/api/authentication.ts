import { Wallet }                   from 'ethers';
import { ProgressCallback }         from 'ethers/utils';
import {
    keccak256,
    toAcceptedKeccak256Format,
    encryptWallet,
    getPasswordStrength,
    PasswordStrengthReport,
}                                   from '@ticket721sources/global';
import { LocalRegisterInputDto }    from '../../../../server/src/api/authentication/dto/LocalRegisterInput.dto';
import { T721SDK }                  from '../../index';
import { AxiosResponse }            from 'axios';
import { LocalRegisterResponseDto } from '../../../../server/src/api/authentication/dto/LocalRegisterResponse.dto';
import { LocalLoginInputDto }       from '../../../../server/src/api/authentication/dto/LocalLoginInput.dto';
import { LocalLoginResponseDto }    from '../../../../server/src/api/authentication/dto/LocalLoginResponse.dto';

export interface FailedRegisterReport {
    status: 'weak';
    report: PasswordStrengthReport;
}

export async function localRegister(email: string, password: string, username: string, wallet: Wallet, progress: ProgressCallback): Promise<AxiosResponse<LocalRegisterResponseDto> | FailedRegisterReport> {

    const self: T721SDK = this;

    progress(0);

    const report = getPasswordStrength(password);
    progress(10);

    if (report.score < 3) {
        return {
            status: 'weak',
            report,
        };
    }

    let last_emitted = 0;
    const encrypted: string = await encryptWallet(wallet, password, (encryption_progress: number): void => {
        if (Math.floor((encryption_progress / 100) * 80) > last_emitted) {
            last_emitted = Math.floor((encryption_progress / 100) * 80);
            progress(10 + last_emitted);
        }
    });

    const hashed = toAcceptedKeccak256Format(keccak256(password));

    const create_user: LocalRegisterInputDto = {
        username,
        password: hashed,
        email,
        wallet: JSON.parse(encrypted),
    };

    return self.post<LocalRegisterInputDto>('/authentication/local/register', {}, create_user);
}

export async function localLogin(email: string, password: string): Promise<AxiosResponse<LocalLoginResponseDto>> {

    const self: T721SDK = this;

    const hashed = toAcceptedKeccak256Format(keccak256(password));

    const login_user: LocalLoginInputDto = {
        password: hashed,
        email,
    };

    return self.post<LocalLoginInputDto>('/authentication/local/login', {}, login_user);
}

