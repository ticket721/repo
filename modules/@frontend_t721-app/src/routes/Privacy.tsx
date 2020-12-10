import React               from 'react';
import { StatusBarMargin } from '@frontend/core/lib/utils/margins/StatusBarMargin';
import { NavbarMargin }    from '@frontend/core/lib/utils/margins/NavbarMargin';
import { TopNavMargin }    from '@frontend/core/lib/utils/margins/TopNavMargin';

const Privacy = React.lazy(() => import('@frontend/core/lib/legal/fr/Privacy'))

export default StatusBarMargin(NavbarMargin(TopNavMargin(Privacy)));
