import React               from 'react';
import { Register }        from '@frontend/core/lib/components';
import { StatusBarMargin } from '@frontend/core/lib/utils/StatusBarMargin';
import { NavbarMargin }    from '@frontend/core/lib/utils/NavbarMargin';

export default StatusBarMargin(NavbarMargin(() => (
    <Register
        createEvent={true}
    />
)));
