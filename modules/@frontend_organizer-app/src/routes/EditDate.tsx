import { MobileWarning }  from '../utils/MobileWarning';
import { EditDate } from '../screens/UpdateDates/EditDate';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(EditDate)));
