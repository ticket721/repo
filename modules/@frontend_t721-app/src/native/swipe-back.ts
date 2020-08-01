import { Capacitor, Plugins } from '@capacitor/core';

if (Capacitor.isPluginAvailable('IosSwipeBack')) {

    if (Plugins.IosSwipeBack) {
        Plugins.IosSwipeBack
            .enable()
            .catch(e => console.warn('Cannot set IOSSwipeBack'))
    }

}
