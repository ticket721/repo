import { useEffect } from 'react';

export const useScrollReset = (): void => {
    useEffect(() => {

        const currentScroll = [window.scrollX, window.scrollY];

        window.scrollTo(0, 0);

        return () => {
            window.scrollTo(currentScroll[0], currentScroll[1]);
        }

    });
}
