import { MobileWarning } from '../utils/MobileWarning';
import { EventsDashboard } from '../screens/Dashboards/EventsDashboard';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(EventsDashboard)));
