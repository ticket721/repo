import React               from 'react';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';
import { FullWidth }           from '../utils/FullWidth';

const CGU = React.lazy(() => import('@frontend/core/lib/legal/fr/CGU'))

export default DesktopNavbarMargin(FullWidth(CGU))
