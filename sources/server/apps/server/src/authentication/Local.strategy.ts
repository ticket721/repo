import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Injectable } from '@nestjs/common';
import { AuthenticationService } from './Authentication.service';
import { PasswordlessUserDto } from './dto/PasswordlessUser.dto';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';
import { StatusCodes } from '@lib/common/utils/codes';

/**
 * Local Strategy to verify that passwords are matching
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    /**
     * Dependency Injection
     *
     * @param authenticationService
     */
    constructor /* instanbul ignore next */(
        private readonly authenticationService: AuthenticationService,
    ) {
        super({
            usernameField: 'email',
        });
    }

    /**
     * Utility to validate user
     *
     * @param email
     * @param password
     */
    async validate(
        email: string,
        password: string,
    ): Promise<PasswordlessUserDto> {
        const resp: ServiceResponse<PasswordlessUserDto> = await this.authenticationService.validateUser(
            email,
            password,
        );

        if (resp.error) {
            switch (resp.error) {
                case 'invalid_credentials':
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
            resp.response.id = resp.response.id.toString();
            return resp.response;
        }
    }
}
