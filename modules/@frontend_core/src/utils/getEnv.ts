export const getEnv = (): any => {
    return {
        ...process.env,
        ...((window as any).injectedEnv || {}),
    };
};
