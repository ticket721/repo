import { NavbarMargin }    from '@frontend/core/lib/utils/margins/NavbarMargin';
import { StatusBarMargin } from '@frontend/core/lib/utils/margins/StatusBarMargin';
import Home                from '../screens/Home';

export default StatusBarMargin(NavbarMargin(Home));
