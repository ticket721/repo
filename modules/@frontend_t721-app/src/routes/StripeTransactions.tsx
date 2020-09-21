import { DesktopWarning }           from '../utils/DesktopWarning';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import { StripeTransactions }       from '@frontend/core/lib/components/StripeSetup';

export default DesktopWarning(InvisibleStatusBarMargin(TopNavMargin(StripeTransactions)));
