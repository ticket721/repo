import { createParamDecorator } from '@nestjs/common';

/**
 * Parameter decorator to inject User
 */
export const User = createParamDecorator((data, req) => {
    return req.user;
});
