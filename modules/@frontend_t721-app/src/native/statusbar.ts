import { Plugins, StatusBarStyle } from '@capacitor/core';
const { StatusBar } = Plugins;

StatusBar.setStyle({ style: StatusBarStyle.Dark })
    .then(() => {
        console.log(`[native]: properly changed status bar color`)
    })
    .catch((e: Error) => {
        console.warn('[native] unable to set status bar color')
    });
