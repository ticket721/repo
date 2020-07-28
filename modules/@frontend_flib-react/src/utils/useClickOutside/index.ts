import { useEffect, useState } from 'react';

export const useClickOutside = (ref: any) => {
    const [clickOutside, setClickOutside] = useState<boolean>(true);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setClickOutside(true);
            } else {
                setClickOutside(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);

    return clickOutside;
};
