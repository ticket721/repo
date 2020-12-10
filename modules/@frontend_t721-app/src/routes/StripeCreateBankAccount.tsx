import { StripeCreateBankAccount }  from '@frontend/core/lib/components/StripeSetup';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/margins/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/margins/TopNavMargin';

export default InvisibleStatusBarMargin(TopNavMargin(StripeCreateBankAccount));
