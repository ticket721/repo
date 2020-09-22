import { StripeCreateBankAccount }  from '@frontend/core/lib/components/StripeSetup';
import { DesktopWarning }           from '../utils/DesktopWarning';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';

export default DesktopWarning(InvisibleStatusBarMargin(TopNavMargin(StripeCreateBankAccount)));
