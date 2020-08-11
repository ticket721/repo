import { ToastContainer } from 'react-toastify';
import styled from '../config/styled';
import React from 'react';
import { ToastContainerProps } from 'react-toastify/dist/types';

const StyledT721ToastContainer: React.FC<ToastContainerProps> = styled(ToastContainer)`
    top: env(safe-area-inset-top);
    top: constant(safe-area-inset-top);
`;

export const T721ToastContainer = () => {
    return <StyledT721ToastContainer position={'top-center'} />;
};
