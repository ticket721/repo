import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/margins/InvisibleStatusBarMargin';
import { NavbarMargin } from '@frontend/core/lib/utils/margins/NavbarMargin';
import GuestList              from '../screens/GuestList';

export default NavbarMargin(InvisibleStatusBarMargin(GuestList));
