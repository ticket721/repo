import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/margins/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/margins/TopNavMargin';
import SearchViewAll              from '../screens/SearchViewAll';

export default InvisibleStatusBarMargin(TopNavMargin(SearchViewAll));
