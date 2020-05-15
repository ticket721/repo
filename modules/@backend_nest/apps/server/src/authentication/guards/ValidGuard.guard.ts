import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PasswordlessUserDto } from '../dto/PasswordlessUser.dto';

/**
 * Guard called to prevent user that are not valid from performing the call
 */
@Injectable()
export class ValidGuard implements CanActivate {
    /**
     * Verifier to check if user is valid
     *
     * @param context
     */
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user: PasswordlessUserDto = request.user;

        return !!user && user.valid;
    }
}
