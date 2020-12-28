import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Injectable } from '@nestjs/common';
import { AuthenticationService } from './Authentication.service';
import { PasswordlessUserDto } from './dto/PasswordlessUser.dto';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { isNil } from 'lodash';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@lib/common/config/Config.service';

/**
 * Local Strategy to verify that passwords are matching
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    /**
     * Dependency Injection
     *
     * @param authenticationService
     * @param configService
     */
    constructor /* instanbul ignore next */(
        private readonly authenticationService: AuthenticationService,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    /**
     * Utility to validate user
     *
     * @param req
     */
    async validate(req: any): Promise<PasswordlessUserDto> {
        const { idToken } = req.body;

        if (idToken === '' || isNil(idToken)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'invalid_google_code',
                },
                StatusCodes.Unauthorized,
            );
        }

        try {
            const client = new OAuth2Client(this.configService.get('GOOGLE_AUTH_CLIENT_ID'));

            const res = await client.verifyIdToken({
                idToken,
                audience: this.configService.get('GOOGLE_AUTH_CLIENT_ID'),
            });

            const { email, given_name, family_name, sub, locale, picture } = res.getPayload();

            const googleUsersResp = await this.authenticationService.createOrRetrieveGoogleUser(
                email,
                given_name,
                family_name,
                sub,
                locale,
                picture,
            );

            if (googleUsersResp.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: 'unable_to_retrieve_user',
                    },
                    StatusCodes.InternalServerError,
                );
            }

            return googleUsersResp.response;
        } catch (e) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'google_auth_error',
                },
                StatusCodes.Unauthorized,
            );
        }
    }
}
