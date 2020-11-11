import { MobileWarning } from '../utils/MobileWarning';
import { CreateCategory }       from '../screens/UpdateCategories/CreateCategory';
import { EventPageWrapper } from '../utils/EventPageWrapper';

export default MobileWarning(EventPageWrapper(CreateCategory));
