import { MobileWarning } from '../utils/MobileWarning';
import { CreateCategory }       from '../screens/UpdateCategories/CreateCategory';
import { EventPageWrapper } from '../utils/EventPageWrapper';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(CreateCategory)));
