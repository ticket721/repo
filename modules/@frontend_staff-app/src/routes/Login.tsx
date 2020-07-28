import { StatusBarMargin } from '@frontend/core/lib/utils/StatusBarMargin';
import { Login }           from '@frontend/core/lib/components';
import { getEnv }          from '@frontend/core/lib/utils/getEnv';

export default StatusBarMargin(() => Login({externalRegister: getEnv().REACT_APP_T721_ORGANIZER_URL + '/register'}));
