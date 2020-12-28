import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@lib/common/config/Config.service';
import { UsersModule } from '@lib/common/users/Users.module';
import { LocalStrategy } from '@app/server/authentication/Local.strategy';
import { JwtStrategy } from '@app/server/authentication/Jwt.strategy';
import { AuthenticationService } from '@app/server/authentication/Authentication.service';
import { AuthenticationController } from '@app/server/authentication/Authentication.controller';
import { PurchasesModule } from '@lib/common/purchases/Purchases.module';
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';
import { EmailModule } from '@lib/common/email/Email.module';
import { GoogleStrategy } from '@app/server/authentication/Google.strategy';

/**
 * Authentication module. Handles users registrations and authentication
 */
@Module({
    imports: [
        UsersModule,
        PurchasesModule,
        ToolBoxModule,
        EmailModule,
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
    providers: [AuthenticationService, LocalStrategy, JwtStrategy, GoogleStrategy],
    controllers: [AuthenticationController],
})
export class AuthenticationModule {}
