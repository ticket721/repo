import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import SearchViewAll              from '../screens/SearchViewAll';

export default InvisibleStatusBarMargin(TopNavMargin(SearchViewAll));
