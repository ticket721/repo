export const isSegmentAvailable = () => {
    return !!(window as any).analytics;
};

export const getSegment = () => {
    return (window as any).analytics;
};

export function* identifyUser(id: string, email: string): IterableIterator<any> {

    if (isSegmentAvailable()) {

        const analytics = getSegment();

        analytics.identify(id, {
            email,
        });

    }
}

