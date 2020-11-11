import { MobileWarning } from '../utils/MobileWarning';
import { EventsDashboard } from '../screens/Dashboards/EventsDashboard';
import { EventPageWrapper } from '../utils/EventPageWrapper';

export default MobileWarning(EventPageWrapper(EventsDashboard));
