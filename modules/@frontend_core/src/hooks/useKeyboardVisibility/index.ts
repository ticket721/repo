import { Plugins, Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

const { Keyboard } = Plugins;

export const useKeyboardVisibility = (): boolean => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (Capacitor.isPluginAvailable('Keyboard')) {
            Keyboard.addListener('keyboardWillShow', () => {
                setVisible(true);
            });

            Keyboard.addListener('keyboardWillHide', () => {
                setVisible(false);
            });
        }

        return () => {
            if (Capacitor.isPluginAvailable('Keyboard')) {
                Keyboard.removeAllListeners();
            }
        };
    }, []);

    return visible;
};
