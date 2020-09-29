import TicketSelection              from '../screens/TicketSelection';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';

export default InvisibleStatusBarMargin(TopNavMargin(TicketSelection));
