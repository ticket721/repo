import { Capacitor, KeyboardResize, Plugins } from '@capacitor/core';

const { Keyboard } = Plugins;

if (Capacitor.isPluginAvailable('Keyboard')) {
    Keyboard.setResizeMode({
        mode: KeyboardResize.None
    }).then(() => {
            console.log(`[native]: properly changed keyboard resize mode`)
        })
        .catch((e: Error) => {
            console.warn('[native] unable to change keyboard resize mode')
        });
}
