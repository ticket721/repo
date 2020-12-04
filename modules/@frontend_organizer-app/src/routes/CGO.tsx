import React               from 'react';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';
import { FullWidth }           from '../utils/FullWidth';

const CGO = React.lazy(() => import('@frontend/core/lib/legal/fr/CGO'))

export default DesktopNavbarMargin(FullWidth(CGO))
