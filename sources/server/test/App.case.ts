import { T721SDK }  from '@ticket721sources/sdk';
import ExpectStatic = Chai.ExpectStatic;
import * as pack    from '../package.json';
import * as branch  from 'git-branch';
import { APIInfos } from '../src/app.types';

export async function getApiInfo(): Promise<void> {
    const { sdk, expect }: { sdk: T721SDK, expect: ExpectStatic } = this;

    const res = await sdk.getApiInfos();
    expect(res.status).to.equal(200);
    const data: APIInfos = res.data;
    expect(data).to.not.be.undefined;
    expect(data.name).to.equal('t721api');
    expect(data.version).to.equal(pack.version);
    expect(data.env).to.equal(`development@${branch.sync()}`);
}
