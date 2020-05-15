import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';

describe('Valid Guard', function() {
    const context: {
        validGuard: ValidGuard;
    } = {
        validGuard: null,
    };

    beforeEach(function() {
        context.validGuard = new ValidGuard();
    });

    describe('canActivate', function() {
        it('should properly allow valid user', function() {
            const injectedContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: {
                            valid: true,
                        },
                    }),
                }),
            };

            const res = context.validGuard.canActivate(injectedContext as any);

            expect(res).toEqual(true);
        });

        it('should properly prevent invalid user', function() {
            const injectedContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: {
                            valid: false,
                        },
                    }),
                }),
            };

            const res = context.validGuard.canActivate(injectedContext as any);

            expect(res).toEqual(false);
        });

        it('should properly prevent undefined user', function() {
            const injectedContext = {
                switchToHttp: () => ({
                    getRequest: () => ({}),
                }),
            };

            const res = context.validGuard.canActivate(injectedContext as any);

            expect(res).toEqual(false);
        });
    });
});
