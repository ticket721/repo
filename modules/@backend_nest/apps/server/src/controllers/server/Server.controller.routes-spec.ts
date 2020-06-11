import { getSDK } from '../../../test/utils';
import { keccak256FromBuffer } from '@common/global';
import { hostname } from 'os';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('getApiInfos (GET /)', function() {
            test('should properly recover api infos', async function() {
                const sdk = await getSDK(getCtx);

                const apiInfos = await sdk.getApiInfos();

                const currentHostname = hostname();

                expect(apiInfos.data).toMatchObject({
                    version: '1.0.0',
                    name: 't721api',
                    instanceHash: keccak256FromBuffer(Buffer.from(currentHostname)),
                });
            });
        });
    };
}
