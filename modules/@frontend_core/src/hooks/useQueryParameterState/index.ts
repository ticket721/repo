import { useHistory } from 'react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

const stringify = (val: any) => {
    switch (typeof val) {
        case 'object':
            return JSON.stringify(val);
        default:
            return val.toString();
    }
};

export const useQueryParameterState = (key: string, defaultValue: any): [string, (val: any) => void] => {
    const history = useHistory();
    const searchParams = useMemo(() => new URLSearchParams(history.location.search), [history.location.search]);
    const [value, _setValue] = useState<string>(
        searchParams.get(key) ? searchParams.get(key).toString() : stringify(defaultValue),
    );

    useEffect(() => {
        const _searchParams = new URLSearchParams(history.location.search);

        _searchParams.set(key, stringify(value));

        history.replace({
            pathname: history.location.pathname,
            search: _searchParams.toString(),
            state: history.location.state,
        });
    }, [value, history, key]);

    const setValue = useCallback((val: any) => _setValue(stringify(val)), [_setValue]);

    return [value, setValue];
};
