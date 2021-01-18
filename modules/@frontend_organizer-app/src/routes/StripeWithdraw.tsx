import { StripeWithdraw }              from '@frontend/core/lib/components/StripeSetup';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';
import { MobileWarning } from '../utils/MobileWarning';

export default MobileWarning(DesktopNavbarMargin(StripeWithdraw));
