import { Register }        from '@frontend/core/lib/components';
import { StatusBarMargin } from '@frontend/core/lib/utils/StatusBarMargin';
import { NavbarMargin }    from '@frontend/core/lib/utils/NavbarMargin';

const BuildRegister = (isDesktop: boolean) => StatusBarMargin(isDesktop ? Register : NavbarMargin(Register));
export default BuildRegister;
