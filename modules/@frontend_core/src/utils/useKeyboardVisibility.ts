import { Plugins } from '@capacitor/core';
import { useEffect, useState } from 'react';

const { Keyboard } = Plugins;

export const useKeyboardVisibility = (): boolean => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (Keyboard) {
            Keyboard.addListener('keyboardWillShow', () => {
                setVisible(true);
            });

            Keyboard.addListener('keyboardWillHide', () => {
                setVisible(false);
            });
        }

        return () => {
            if (Keyboard) {
                Keyboard.removeAllListeners();
            }
        };
    }, []);

    return visible;
};
