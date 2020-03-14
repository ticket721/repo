import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@lib/common/config/Config.service';
import { AuthenticationTasks } from '@app/worker/authentication/Authentication.tasks';

/**
 * Authentication module. Handles users registrations and authentication
 */
@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRATION'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthenticationTasks],
})
export class AuthenticationModule {}
