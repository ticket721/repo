import Wallet              from '../screens/Wallet';
import { StatusBarMargin } from '@frontend/core/lib/utils/StatusBarMargin';
import { DesktopWarning }  from '../utils/DesktopWarning';

export default DesktopWarning(StatusBarMargin(Wallet));
