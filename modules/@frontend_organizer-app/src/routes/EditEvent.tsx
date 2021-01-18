import { MobileWarning }  from '../utils/MobileWarning';
import { EditEvent } from '../screens/EditEvent';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(EditEvent)));
