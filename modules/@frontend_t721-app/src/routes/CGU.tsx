import React               from 'react';
import { StatusBarMargin } from '@frontend/core/lib/utils/StatusBarMargin';
import { NavbarMargin }    from '@frontend/core/lib/utils/NavbarMargin';
import { TopNavMargin }    from '@frontend/core/lib/utils/TopNavMargin';

const CGU = React.lazy(() => import('@frontend/core/lib/legal/fr/CGU'))

export default StatusBarMargin(NavbarMargin(TopNavMargin(CGU)));
