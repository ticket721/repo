import { useEffect, useState } from 'react';

export const useKeyboardState = () => {
    const [keyboardState, setKeyboardState] = useState({
        isOpen: false,
        keyboardHeight: 0,
    });

    useEffect(() => {
        const onKeyboardDidShow = (info: any) => {
            console.log(JSON.stringify(info));
            console.log('keyboard size changed did show');
            setKeyboardState({
                isOpen: true,
                keyboardHeight: info.keyboardHeight,
            });
        };

        window.addEventListener('keyboardDidShow', onKeyboardDidShow);

        const onKeyboardDidHide = () => {
            console.log('keyboard size changed did hide');
            setKeyboardState({
                isOpen: false,
                keyboardHeight: 0,
            });
        };

        window.addEventListener('keyboardDidHide', onKeyboardDidHide);

        return () => {
            window.removeEventListener('keyboardDidShow', onKeyboardDidShow);
            window.removeEventListener('keyboardDidHide', onKeyboardDidHide);
        };
    }, []);

    return keyboardState;
};
