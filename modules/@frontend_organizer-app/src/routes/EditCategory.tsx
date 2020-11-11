import { MobileWarning } from '../utils/MobileWarning';
import { EditCategory }   from '../screens/UpdateCategories/EditCategory';
import { EventPageWrapper } from '../utils/EventPageWrapper';

export default MobileWarning(EventPageWrapper(EditCategory));
