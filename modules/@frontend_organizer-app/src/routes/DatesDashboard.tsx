import { MobileWarning } from '../utils/MobileWarning';
import { DatesDashboard } from '../screens/Dashboards/DatesDashboard';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(DatesDashboard)));
