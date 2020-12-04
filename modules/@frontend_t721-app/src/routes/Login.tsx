import React               from 'react';
import { Login }           from '@frontend/core/lib/components';
import { StatusBarMargin } from '@frontend/core/lib/utils/margins/StatusBarMargin';
import { NavbarMargin }    from '@frontend/core/lib/utils/margins/NavbarMargin';

export default StatusBarMargin(NavbarMargin(() => (
    <Login
        createEvent={true}
    />
)));
