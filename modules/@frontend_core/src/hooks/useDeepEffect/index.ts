import { useEffect, EffectCallback, DependencyList } from 'react';

export const useDeepEffect = (effect: EffectCallback, deps?: DependencyList) => {
    const stringifiedDeps = deps.map((e) => JSON.stringify(e));

    useEffect(effect, stringifiedDeps);
};
