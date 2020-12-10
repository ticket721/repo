import React                   from 'react';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';
import { FullWidth }           from '../utils/FullWidth';

const Acknowledgements = React.lazy(() => import('@frontend/core/lib/legal/fr/Acknowledgements'))

export default DesktopNavbarMargin(FullWidth(Acknowledgements));
