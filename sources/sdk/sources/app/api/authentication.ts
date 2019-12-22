import { ProgressCallback }         from 'ethers/utils';
import {
    keccak256,
    toAcceptedKeccak256Format,
    encryptWallet,
    getPasswordStrength,
    PasswordStrengthReport,
    Wallet,
    Web3RegisterSigner,
    Web3LoginSigner,
}                                   from '@ticket721sources/global';
import { T721SDK }                  from '../../index';
import { AxiosResponse }            from 'axios';
import { LocalRegisterInputDto }    from '@app/server/authentication/dto/LocalRegisterInput.dto';
import { LocalRegisterResponseDto } from '@app/server/authentication/dto/LocalRegisterResponse.dto';
import { LocalLoginResponseDto }    from '@app/server/authentication/dto/LocalLoginResponse.dto';
import { LocalLoginInputDto }       from '@app/server/authentication/dto/LocalLoginInput.dto';
import { EIP712Payload }            from '@ticket721/e712';
import { Web3RegisterResponseDto }  from '@app/server/authentication/dto/Web3RegisterResponse.dto';
import { Web3RegisterInputDto }     from '@app/server/authentication/dto/Web3RegisterInput.dto';
import { Web3LoginInputDto }        from '@app/server/authentication/dto/Web3LoginInput.dto';

export interface FailedRegisterReport {
    report_status: 'weak';
    report: PasswordStrengthReport;
}

export async function localRegister(email: string, password: string, username: string, wallet: Wallet, progress: ProgressCallback): Promise<AxiosResponse<LocalRegisterResponseDto> | FailedRegisterReport> {

    const self: T721SDK = this;

    progress(0);

    const report = getPasswordStrength(password);
    progress(10);

    if (report.score < 3) {
        return {
            report_status: 'weak',
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

export async function web3Register(email: string, username: string, timestamp: number, address: string, signature: string): Promise<AxiosResponse<Web3RegisterResponseDto>> {

    const self: T721SDK = this;

    const create_web3_user: Web3RegisterInputDto = {
        email,
        username,
        timestamp: timestamp.toString(),
        address,
        signature,
    };

    return self.post<Web3RegisterInputDto>('/authentication/web3/register', {}, create_web3_user);
}

export async function web3Login(timestamp: number, signature: string): Promise<AxiosResponse<Web3RegisterResponseDto>> {

    const self: T721SDK = this;

    const login_web3_user: Web3LoginInputDto = {
        timestamp: timestamp.toString(),
        signature,
    };

    return self.post<Web3LoginInputDto>('/authentication/web3/login', {}, login_web3_user);
}


export function web3RegisterPayload(email: string, username: string, network_id: number): [number, EIP712Payload] {
    const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(network_id);
    return web3RegisterSigner.generateRegistrationProofPayload(email, username);
}

export function web3LoginPayload(network_id: number): [number, EIP712Payload] {
    const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(network_id);
    return web3LoginSigner.generateAuthenticationProofPayload();
}


