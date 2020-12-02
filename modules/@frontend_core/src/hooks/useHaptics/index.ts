import { Plugins, Capacitor, HapticsPlugin } from '@capacitor/core';

export { HapticsImpactStyle, HapticsNotificationType } from '@capacitor/core';

const { Haptics } = Plugins;

export const useHaptics = (): HapticsPlugin => {
    if (Capacitor.isPluginAvailable('Haptics')) {
        return Haptics;
    }
    return {
        impact: (...args) => null,
        notification: (...args) => null,
        vibrate: (...args) => null,
        selectionStart: (...args) => null,
        selectionChanged: (...args) => null,
        selectionEnd: (...args) => null,
        addListener: (...args) => null,
    };
};
