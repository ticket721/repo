import React               from 'react';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';
import { FullWidth }           from '../utils/FullWidth';

const Privacy = React.lazy(() => import('@frontend/core/lib/legal/fr/Privacy'))

export default DesktopNavbarMargin(FullWidth(Privacy))
