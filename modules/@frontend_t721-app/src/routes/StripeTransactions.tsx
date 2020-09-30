import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import { StripeTransactions }       from '@frontend/core/lib/components/StripeSetup';

export default InvisibleStatusBarMargin(TopNavMargin(StripeTransactions));
