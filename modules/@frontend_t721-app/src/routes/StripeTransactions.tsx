import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/margins/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/margins/TopNavMargin';
import { StripeTransactions }       from '@frontend/core/lib/components/StripeSetup';
import { BottomMargin }             from '@frontend/core/lib/utils/margins/BottomMargin';

export default InvisibleStatusBarMargin(TopNavMargin(BottomMargin(StripeTransactions)));
