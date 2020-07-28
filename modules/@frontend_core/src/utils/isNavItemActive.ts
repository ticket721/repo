export const isNavItemActive = (expected: string, location: any): string => {
    if (location.pathname === expected) {
        return 'active';
    }
    return undefined;
};
