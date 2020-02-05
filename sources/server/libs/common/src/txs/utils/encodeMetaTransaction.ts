import { MetaTransaction } from '@ticket721sources/global';

enum MTXArguments {
    NONCE,
    ADDR,
    NUMS,
    BDATA,
}

export async function encodeMetaTransaction(
    mtx: MetaTransaction,
    signature: string,
): Promise<[number, string[], string[], string]> {
    const ret: [number, string[], string[], string] = [null, [], [], signature];

    ret[MTXArguments.NONCE] = mtx.nonce;

    for (const param of mtx.parameters) {
        ret[MTXArguments.ADDR].push(param.to);
        ret[MTXArguments.ADDR].push(param.relayer);
        ret[MTXArguments.NUMS].push(param.value);
        ret[MTXArguments.NUMS].push((param.data.length / 2 - 1).toString()); // /2 because of hex, -1 because of 0x
        ret[MTXArguments.BDATA] = `${ret[MTXArguments.BDATA]}${param.data.slice(
            2,
        )}`;
    }

    return ret;
}
