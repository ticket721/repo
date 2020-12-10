import { useEffect, useState } from 'react';

export const useIncrement = (interval: number): number => {
    const [value, setValue] = useState(0);

    useEffect(() => {

        const timeoutId = setTimeout(() => {
            setValue(value + 1);
        }, interval);

        return () => {
            clearTimeout(timeoutId);
        }

    }, [value, interval])

    return value;
}
