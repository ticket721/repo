export const computeProfilePath = (path: string, extraPath: string = ''): string => {
    const drawerPathMatchArray = path.match(/^((\/([a-z]|-)+)?\/profile)/);

    if (!drawerPathMatchArray) {
        return `/`;
    }

    return drawerPathMatchArray[0] + extraPath;
};
