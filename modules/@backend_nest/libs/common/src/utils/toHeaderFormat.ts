/**
 * Convert env format to web3 provider header format
 *
 * @param headers
 */
export function toHeaderFormat(headers: { [key: string]: string }): { name: string; value: string }[] {
    const ret: { name: string; value: string }[] = [];

    if (Object.keys(headers).length === 0) {
        return undefined;
    }

    for (const key of Object.keys(headers)) {
        ret.push({
            name: key,
            value: headers[key],
        });
    }

    return ret;
}
