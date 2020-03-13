import { RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { Reflector } from '@nestjs/core';
import { instance, mock, when } from 'ts-mockito';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', function() {
    const context: {
        rolesGuard: RolesGuard;
        reflectorMock: Reflector;
        contextMock: ExecutionContext;
    } = {
        rolesGuard: null,
        reflectorMock: null,
        contextMock: null,
    };

    beforeEach(async function() {
        context.reflectorMock = mock(Reflector);
        context.rolesGuard = new RolesGuard(instance(context.reflectorMock));
        context.contextMock = mock<ExecutionContext>();
    });

    describe('canActivate', function() {
        it('should allow authenticated user', async function() {
            const roles = ['authenticated'];
            const user = {
                role: 'authenticated',
            };

            when(context.contextMock.getHandler()).thenReturn(null);
            when(context.reflectorMock.get<string[]>('roles', null)).thenReturn(roles);
            when(context.contextMock.switchToHttp()).thenReturn({
                getRequest: () =>
                    ({
                        user,
                    } as any),
            } as any);

            expect(context.rolesGuard.canActivate(instance(context.contextMock))).toEqual(true);
        });

        it('should not allow authenticated user', async function() {
            const roles = ['admin'];
            const user = {
                role: 'authenticated',
            };

            when(context.contextMock.getHandler()).thenReturn(null);
            when(context.reflectorMock.get<string[]>('roles', null)).thenReturn(roles);
            when(context.contextMock.switchToHttp()).thenReturn({
                getRequest: () =>
                    ({
                        user,
                    } as any),
            } as any);

            expect(context.rolesGuard.canActivate(instance(context.contextMock))).toEqual(false);
        });

        it('should not allow unauthenticated', async function() {
            const roles = ['authenticated'];

            when(context.contextMock.getHandler()).thenReturn(null);
            when(context.reflectorMock.get<string[]>('roles', null)).thenReturn(roles);
            when(context.contextMock.switchToHttp()).thenReturn({
                getRequest: () =>
                    ({
                        user: null,
                    } as any),
            } as any);

            expect(context.rolesGuard.canActivate(instance(context.contextMock))).toEqual(false);
        });

        it('should allow any user', async function() {
            const user = {
                role: 'authenticated',
            };

            when(context.contextMock.getHandler()).thenReturn(null);
            when(context.reflectorMock.get<string[]>('roles', null)).thenReturn(null);
            when(context.contextMock.switchToHttp()).thenReturn({
                getRequest: () =>
                    ({
                        user,
                    } as any),
            } as any);

            expect(context.rolesGuard.canActivate(instance(context.contextMock))).toEqual(true);
        });
    });
});
