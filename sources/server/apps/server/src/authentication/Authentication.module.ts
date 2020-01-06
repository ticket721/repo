import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule } from '@lib/common/config/Config.module';
import { ConfigService } from '@lib/common/config/Config.service';
import { UsersModule } from '@lib/common/users/Users.module';
import { Web3TokensModule } from '@app/server/web3token/Web3Tokens.module';
import { Web3Strategy } from '@app/server/authentication/Web3.strategy';
import { Config } from '@app/server/utils/Config.joi';
import { LocalStrategy } from '@app/server/authentication/Local.strategy';
import { JwtStrategy } from '@app/server/authentication/Jwt.strategy';
import { AuthenticationService } from '@app/server/authentication/Authentication.service';
import { AuthenticationController } from '@app/server/authentication/Authentication.controller';
import { AuthenticationTasks } from '@app/server/authentication/Authentication.tasks';

/**
 * Authentication module. Handles users registrations and authentication
 */
@Module({
    imports: [
        UsersModule,
        Web3TokensModule,
        JwtModule.registerAsync({
            imports: [ConfigModule.register(Config)],
            useFactory: async (
                configService: ConfigService,
            ): Promise<JwtModuleOptions> => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRATION'),
                },
            }),
            inject: [ConfigService],
        }),
        ConfigModule.register(Config),
    ],
    providers: [
        AuthenticationService,
        AuthenticationTasks,
        LocalStrategy,
        JwtStrategy,
        Web3Strategy,
    ],
    controllers: [AuthenticationController],
})
export class AuthenticationModule {}
