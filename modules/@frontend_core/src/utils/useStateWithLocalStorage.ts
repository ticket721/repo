import React from 'react';

export const useStateWithLocalStorage = (localStorageKey: string, initialValue: any = null) => {
    const [value, setValue] = React.useState(JSON.parse(localStorage.getItem(localStorageKey)) || initialValue);

    React.useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(value));
    }, [value, localStorageKey]);

    return [value, setValue];
};
