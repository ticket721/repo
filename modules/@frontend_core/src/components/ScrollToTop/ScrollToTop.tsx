import { useEffect } from 'react';

export const ScrollToTop = ({ children }: any) => {
    useEffect(() => {
        return () => {
            window.scrollTo(0, 0);
        };
    }, []);

    return children;
};
