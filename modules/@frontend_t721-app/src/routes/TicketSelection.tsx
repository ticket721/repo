import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import TicketSelection              from '../screens/TicketSelection';

export default InvisibleStatusBarMargin(TopNavMargin(TicketSelection));
