import { Capacitor, Plugins } from '@capacitor/core';

export const isIABAvailable = (): boolean => {
    return Capacitor.isPluginAvailable('Browser');
};

export const open = async (url: string, windowName: string, onEnd?: () => void): Promise<void> => {
    if (isIABAvailable()) {
        await Plugins.Browser.open({
            url,
            windowName,
            presentationStyle: 'popover',
            toolbarColor: 'red'
        });
        if (onEnd) {
            Plugins.Browser.addListener('browserFinished', onEnd);
        }
        return ;
    } else {
        return window.location.replace(url);
    }
};
