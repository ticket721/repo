import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import { DesktopWarning }           from '../utils/DesktopWarning';
import { StripeSetup }              from '@frontend/core/lib/components/StripeSetup';
import React                        from 'react';

export default DesktopWarning(InvisibleStatusBarMargin(TopNavMargin(StripeSetup)));
