import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/margins/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/margins/TopNavMargin';
import TicketSelection              from '../screens/TicketSelection';

export default InvisibleStatusBarMargin(TopNavMargin(TicketSelection));
