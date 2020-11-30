import { useEffect, useState } from 'react';
import { Capacitor, KeyboardInfo, Plugins } from '@capacitor/core';

export const useKeyboardState = () => {
    const [keyboardState, setKeyboardState] = useState({
        isOpen: false,
        keyboardHeight: 0,
    });

    useEffect(() => {
        if (Capacitor.isPluginAvailable('Keyboard')) {
            Plugins.Keyboard.addListener('keyboardDidShow', (info: KeyboardInfo) => {
                setKeyboardState({
                    isOpen: true,
                    keyboardHeight: info.keyboardHeight,
                });
            });

            Plugins.Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardState({
                    isOpen: false,
                    keyboardHeight: 0,
                });
            });
        }
    }, []);

    return keyboardState;
};
