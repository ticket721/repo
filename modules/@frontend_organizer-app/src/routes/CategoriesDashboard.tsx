import { MobileWarning } from '../utils/MobileWarning';
import { CategoriesDashboard } from '../screens/Dashboards/CategoriesDashboard';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(CategoriesDashboard)));
