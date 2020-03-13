import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { PasswordlessUserDto } from '../dto/PasswordlessUser.dto';

/**
 * Roles decorator
 *
 * @param roles
 * @constructor
 */
/* istanbul ignore next */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Guard called to prevent unauthorized users from calling route
 */
@Injectable()
export class RolesGuard implements CanActivate {
    /**
     * Dependency Injection
     *
     * @param reflector
     */
    constructor(private readonly reflector: Reflector) {}

    /**
     * Verifier to check if uzer has adequate rights
     *
     * @param context
     */
    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());

        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: PasswordlessUserDto = request.user;

        if (!user) {
            return false;
        }

        return roles.indexOf(user.role) !== -1;
    }
}
