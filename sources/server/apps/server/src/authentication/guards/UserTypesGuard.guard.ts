import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { PasswordlessUserDto } from '../dto/PasswordlessUser.dto';

/**
 * UserTypes decorator
 *
 * @param userTypes
 * @constructor
 */
/* istanbul ignore next */
export const UserTypes = (...userTypes: string[]) => SetMetadata('usertypes', userTypes);

/**
 * Guard called to prevent unauthorized users from calling route
 */
@Injectable()
export class UserTypesGuard implements CanActivate {
    /**
     * Dependency Injection
     *
     * @param reflector
     */
    constructor(private readonly reflector: Reflector) {}

    /**
     * Verifier to check if user has adequate type
     *
     * @param context
     */
    canActivate(context: ExecutionContext): boolean {
        const userTypes = this.reflector.get<string[]>('usertypes', context.getHandler());

        if (!userTypes) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: PasswordlessUserDto = request.user;

        if (!user) {
            return false;
        }

        return userTypes.indexOf(user.type) !== -1;
    }
}
