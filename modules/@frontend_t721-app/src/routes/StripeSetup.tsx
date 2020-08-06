import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import { DesktopWarning }           from '../utils/DesktopWarning';
import { StripeSetup }              from '@frontend/core/lib/components/StripeSetup';
import React                        from 'react';
import { CtaMargin }                from '../utils/CtaMargin';

export default InvisibleStatusBarMargin(TopNavMargin(CtaMargin(StripeSetup)));
// export default DesktopWarning(InvisibleStatusBarMargin(TopNavMargin(StripeSetup)));
