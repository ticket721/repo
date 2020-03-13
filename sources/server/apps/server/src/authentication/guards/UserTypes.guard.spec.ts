import { UserTypesGuard } from '@app/server/authentication/guards/UserTypesGuard.guard';
import { Reflector } from '@nestjs/core';
import { instance, mock, when } from 'ts-mockito';
import { ExecutionContext } from '@nestjs/common';

describe('UserTypesGuard', function() {
    const context: {
        userTypesGuard: UserTypesGuard;
        reflectorMock: Reflector;
        contextMock: ExecutionContext;
    } = {
        userTypesGuard: null,
        reflectorMock: null,
        contextMock: null,
    };

    beforeEach(async function() {
        context.reflectorMock = mock(Reflector);
        context.userTypesGuard = new UserTypesGuard(instance(context.reflectorMock));
        context.contextMock = mock<ExecutionContext>();
    });

    describe('canActivate', function() {
        it('should allow t721 user', async function() {
            const roles = ['t721'];
            const user = {
                type: 't721',
            };

            when(context.contextMock.getHandler()).thenReturn(null);
            when(context.reflectorMock.get<string[]>('usertypes', null)).thenReturn(roles);
            when(context.contextMock.switchToHttp()).thenReturn({
                getRequest: () =>
                    ({
                        user,
                    } as any),
            } as any);

            expect(context.userTypesGuard.canActivate(instance(context.contextMock))).toEqual(true);
        });

        it('should allow any user', async function() {
            const user = {
                type: 't721',
            };

            when(context.contextMock.getHandler()).thenReturn(null);
            when(context.reflectorMock.get<string[]>('usertypes', null)).thenReturn(null);
            when(context.contextMock.switchToHttp()).thenReturn({
                getRequest: () =>
                    ({
                        user,
                    } as any),
            } as any);

            expect(context.userTypesGuard.canActivate(instance(context.contextMock))).toEqual(true);
        });

        it('should not allow t721 user', async function() {
            const roles = ['web3'];
            const user = {
                type: 't721',
            };

            when(context.contextMock.getHandler()).thenReturn(null);
            when(context.reflectorMock.get<string[]>('usertypes', null)).thenReturn(roles);
            when(context.contextMock.switchToHttp()).thenReturn({
                getRequest: () =>
                    ({
                        user,
                    } as any),
            } as any);

            expect(context.userTypesGuard.canActivate(instance(context.contextMock))).toEqual(false);
        });

        it('should not allow untyped user', async function() {
            const roles = ['web3'];

            when(context.contextMock.getHandler()).thenReturn(null);
            when(context.reflectorMock.get<string[]>('usertypes', null)).thenReturn(roles);
            when(context.contextMock.switchToHttp()).thenReturn({
                getRequest: () =>
                    ({
                        user: null,
                    } as any),
            } as any);

            expect(context.userTypesGuard.canActivate(instance(context.contextMock))).toEqual(false);
        });
    });
});
