import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;

if (Capacitor.isPluginAvailable('StatusBar')) {
    StatusBar.setStyle({ style: StatusBarStyle.Dark })
        .then(() => {
            console.log(`[native]: properly changed status bar color`)
        })
        .catch((e: Error) => {
            console.warn('[native] unable to set status bar color')
        });
}
