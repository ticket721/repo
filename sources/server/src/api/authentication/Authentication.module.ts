import { Module }                      from '@nestjs/common';
import { UsersModule }                 from '../users/Users.module';
import { AuthenticationService }       from './Authentication.service';
import { AuthenticationController }    from './Authentication.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule }                from '../../config/Config.module';
import { ConfigService }               from '../../config/Config.service';
import { LocalStrategy }               from './Local.strategy';
import { JwtStrategy }                 from './Jwt.strategy';

/**
 * Authentication module. Handles users registrations and authentication
 */
@Module({
    imports: [
        UsersModule,
        JwtModule.registerAsync(
            {
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRATION'),
                    },
                }),
                inject: [ConfigService],
            }),
        ConfigModule,
    ],
    providers: [AuthenticationService, LocalStrategy, JwtStrategy],
    controllers: [AuthenticationController],
})
export class AuthenticationModule {
}
