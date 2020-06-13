export const appendProfilePath = (path: string, extraPath: string = ''): string => {

    const drawerPathMatchArray = (path.match(/^((\/([a-z]|-)+)?\/profile)/));

    if (!drawerPathMatchArray) {
        if (path.lastIndexOf('/') === path.length - 1) {
            return `${path}profile${extraPath !== '' ? '/' + extraPath : ''}`;
        } else {
            return `${path}/profile${extraPath !== '' ? '/' + extraPath : ''}`;
        }
    }

    return drawerPathMatchArray[0] + extraPath;

};
