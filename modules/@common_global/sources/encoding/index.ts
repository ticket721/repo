export const b64Encode = (input: string): string => {
    return Buffer.from(input).toString('base64');
};

export const b64Decode = (input: string): string => {
    return Buffer.from(input, 'base64').toString();
};
