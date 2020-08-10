import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { StripeSetup }              from '@frontend/core/lib/components/StripeSetup';
import React                        from 'react';

export default InvisibleStatusBarMargin(StripeSetup);
// export default DesktopWarning(InvisibleStatusBarMargin(TopNavMargin(StripeSetup)));
