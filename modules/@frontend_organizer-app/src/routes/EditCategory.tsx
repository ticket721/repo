import { MobileWarning } from '../utils/MobileWarning';
import { EditCategory }   from '../screens/UpdateCategories/EditCategory';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(EditCategory)));
