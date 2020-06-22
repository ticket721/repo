import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/ducks';
import { CacheCore }                        from '../../cores/cache/CacheCore';
import { Dispatch, useEffect, useState }    from 'react';
import { RegisterEntity, UnregisterEntity } from '../../redux/ducks/cache';

interface RequestResp<ReturnType> {
  data: ReturnType;
  error: any;
  loading: boolean;
  called: boolean;
}

export type RequestBag<ReturnType> = {
  response: RequestResp<ReturnType>;
  lazyRequest: (lazyArgs: any, uuid?: string) => void;
};

export const useLazyRequest = <ReturnType>(method: string, initialUuid: string): RequestBag<ReturnType> => {
  const [ called, setCalled ]: [ boolean, Dispatch<boolean> ] = useState(null);
  const [ args, setArgs ]: [ any, Dispatch<any> ] = useState(null);
  const response: RequestResp<ReturnType> = {
    data: useSelector((state: AppState) => args ? state.cache.items[CacheCore.key(method, args)]?.data : undefined),
    error: useSelector((state: AppState) => args ? state.cache.items[CacheCore.key(method, args)]?.error : undefined),
    loading: !useSelector((state: AppState) => args ? state.cache.items[CacheCore.key(method, args)]: false),
    called,
  };

  const dispatch = useDispatch();
  const lazyRequest = (lazyArgs: any): void => {
    dispatch(RegisterEntity(method, lazyArgs, initialUuid, 0));
    setArgs(lazyArgs);
    setCalled(true);
  };

  const stringifyArgs = JSON.stringify(args);

  useEffect(() => {
    setCalled(false);
    return (): void => {
      if (args) {
        dispatch(UnregisterEntity(CacheCore.key(method, args), initialUuid));
      }
    }
  }, [stringifyArgs]);

  return {
    response,
    lazyRequest,
  };
};
