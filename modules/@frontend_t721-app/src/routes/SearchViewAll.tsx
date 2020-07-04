import { InvisibleStatusBarMargin } from '../utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '../utils/TopNavMargin';
import SearchViewAll                from '../screens/SearchViewAll';

export default InvisibleStatusBarMargin(TopNavMargin(SearchViewAll));
