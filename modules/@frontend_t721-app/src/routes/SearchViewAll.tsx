import SearchViewAll                from '../screens/SearchViewAll';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import { DesktopWarning }           from '../utils/DesktopWarning';

export default DesktopWarning(InvisibleStatusBarMargin(TopNavMargin(SearchViewAll)));
