import { getSDK } from '../../../test/utils';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('getApiInfos (GET /)', function() {
            test.concurrent('should properly recover api infos', async function() {
                const sdk = await getSDK(getCtx);

                const apiInfos = await sdk.getApiInfos();

                expect(apiInfos.data).toMatchObject({
                    version: '1.0.0',
                    name: 't721api',
                });
            });
        });
    };
}
