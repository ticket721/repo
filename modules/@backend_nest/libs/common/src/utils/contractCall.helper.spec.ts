import { contractCallHelper } from '@lib/common/utils/contractCall.helper';
import { NestError }          from '@lib/common/utils/NestError';

describe('contractCall Helper', function() {
    it('should properly call the appropriate method', async function() {
        // DECLARE
        const methodName = 'myMethod';
        const args = ['test'];
        const contract = {
            methods: {
                myMethod: (arg: string) => ({
                    call: () => arg,
                }),
            },
        };

        // MOCK

        // TRIGGER
        const res = await contractCallHelper(contract, methodName, {}, ...args);

        // CHECK RETURNs
        expect(res.error).toEqual(null);
        expect(res.response).toEqual('test');

        // CHECK CALLS
    });

    it('should properly call the appropriate method and return error', async function() {
        // DECLARE
        const methodName = 'myMethod';
        const args = ['test'];
        const contract = {
            methods: {
                myMethod: (arg: string) => ({
                    call: () => {
                        throw new NestError('this method reverted');
                    },
                }),
            },
        };

        // MOCK

        // TRIGGER
        const res = await contractCallHelper(contract, methodName, {}, ...args);

        // CHECK RETURNs
        expect(res.error).toEqual('this method reverted');
        expect(res.response).toEqual(null);

        // CHECK CALLS
    });
});
