import React               from 'react';
import { StatusBarMargin } from '@frontend/core/lib/utils/StatusBarMargin';
import { NavbarMargin }    from '@frontend/core/lib/utils/NavbarMargin';
import { TopNavMargin }    from '@frontend/core/lib/utils/TopNavMargin';

const Acknowledgements = React.lazy(() => import('@frontend/core/lib/legal/fr/Acknowledgements'))

export default StatusBarMargin(NavbarMargin(TopNavMargin(Acknowledgements)));
