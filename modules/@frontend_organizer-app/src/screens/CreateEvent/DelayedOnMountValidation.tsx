import { useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { EventCreationPayload } from '@common/global';

export const DelayedOnMountValidation = () => {
    const { validateForm } = useFormikContext<EventCreationPayload>();

    useEffect(() => {
        setTimeout(() => validateForm(), 500);
    // eslint-disable-next-line
    }, []);

    return <></>;
}
