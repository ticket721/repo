declare global {
    const injectedEnv: any;
}

export const getEnv = (): any => {
    return {
        ...process.env,
        ...(injectedEnv || {}),
    };
};
