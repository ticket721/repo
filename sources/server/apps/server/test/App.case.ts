import { T721SDK } from '@ticket721sources/sdk';
import pack from '../../../package.json';
import branch from 'git-branch';
import { APIInfos } from '../src/Server.types';
import { INestApplication } from '@nestjs/common';

export async function getApiInfo(
    getCtx: () => { app: INestApplication; sdk: T721SDK },
): Promise<void> {
    jest.setTimeout(60000);
    const { sdk }: { sdk: T721SDK } = getCtx();

    const res = await sdk.getApiInfos();
    expect(res.status).toEqual(200);
    const data: APIInfos = res.data;
    expect(data).toBeDefined();
    expect(data.name).toEqual('t721api');
    expect(data.version).toEqual(pack.version);
    expect(data.env).toEqual(`development@${branch.sync()}`);
}
