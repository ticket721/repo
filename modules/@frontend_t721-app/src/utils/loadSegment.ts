import { segmentPlugin } from '@jairemix/capacitor-segment';
import { getEnv }        from '@frontend/core/lib/utils/getEnv';

segmentPlugin.setUp({
    key: getEnv().REACT_APP_SEGMENT_API_KEY,
    trackLifecycle: true, // optional; defaults to false
});

