import { MobileWarning } from '../utils/MobileWarning';
import { CreateDate }           from '../screens/UpdateDates/CreateDate';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(CreateDate)));
