import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Injectable } from '@nestjs/common';
import { AuthenticationService } from './Authentication.service';
import { PasswordlessUserDto } from './dto/PasswordlessUser.dto';
import { Web3TokenDto } from '@app/server/web3token/dto/Web3Token.dto';
import { Web3TokensService } from '@app/server/web3token/Web3Tokens.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';
import { StatusCodes } from '@lib/common/utils/codes';

/**
 * Web3 Strategy to verify that signatures are valid
 */
@Injectable()
export class Web3Strategy extends PassportStrategy(Strategy, 'web3') {
    /**
     * Dependency Injection
     *
     * @param authenticationService
     * @param web3TokensService
     */
    constructor /* instanbul ignore next */(
        private readonly authenticationService: AuthenticationService,
        private readonly web3TokensService: Web3TokensService,
    ) {
        super({
            usernameField: 'timestamp',
            passwordField: 'signature',
        });
    }

    /**
     * Utility to validate web3 user
     *
     * @param timestamp
     * @param signature
     */
    async validate(timestamp: string, signature: string): Promise<PasswordlessUserDto> {
        const resp: ServiceResponse<PasswordlessUserDto> = await this.authenticationService.validateWeb3User(
            timestamp,
            signature,
        );

        if (resp.error) {
            switch (resp.error) {
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
            const web3Token: Web3TokenDto = {
                timestamp: parseInt(timestamp, 10),
                address: resp.response.address,
            };

            const token: ServiceResponse<Web3TokenDto> = await this.web3TokensService.check(web3Token);

            if (token.error) {
                switch (token.error) {
                    case 'unexpected_error':
                    default:
                        throw new HttpException(
                            {
                                status: StatusCodes.InternalServerError,
                                message: token.error,
                            },
                            StatusCodes.InternalServerError,
                        );
                }
            }

            if (token.response !== null) {
                throw new HttpException(
                    {
                        status: StatusCodes.Unauthorized,
                        message: 'duplicate_token_usage',
                    },
                    StatusCodes.Unauthorized,
                );
            }

            const regRes = await this.web3TokensService.register(web3Token);

            if (regRes.error) {
                switch (regRes.error) {
                    case 'unexpected_error':
                    default:
                        throw new HttpException(
                            {
                                status: StatusCodes.InternalServerError,
                                message: regRes.error,
                            },
                            StatusCodes.InternalServerError,
                        );
                }
            }

            return resp.response;
        }
    }
}
