import { InvisibleStatusBarMargin } from '../utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '../utils/TopNavMargin';
import TicketSelection              from '../screens/TicketSelection';

export default InvisibleStatusBarMargin(TopNavMargin(TicketSelection));
