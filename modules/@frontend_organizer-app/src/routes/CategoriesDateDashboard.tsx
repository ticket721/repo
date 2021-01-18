import { MobileWarning } from '../utils/MobileWarning';
import { CategoriesDateDashboard } from '../screens/Dashboards/CategoriesDateDashboard';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(CategoriesDateDashboard)));
