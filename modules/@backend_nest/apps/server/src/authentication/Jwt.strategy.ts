import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@lib/common/config/Config.service';
import { UsersService } from '@lib/common/users/Users.service';
import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * JWT Strategy to handle the JWT token verification
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    /**
     * Dependency Injection
     *
     * @param configService
     * @param usersService
     */
    constructor /* instanbul ignore next */(configService: ConfigService, private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    /**
     * Utility to validate user
     *
     * @param payload
     */
    async validate(payload: any): Promise<UserDto> {
        if (payload.sub && payload.username) {
            const user = await this.usersService.findById(payload.sub);
            user.response.id = user.response.id.toString();
            delete user.response.password;
            return user.response;
        }
        return null;
    }
}
