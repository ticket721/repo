import { StripeCreateBankAccount }  from '@frontend/core/lib/components/StripeSetup';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';

export default InvisibleStatusBarMargin(TopNavMargin(StripeCreateBankAccount));
