import { ToastContainer }      from 'react-toastify';
import styled                  from '../config/styled';
import React                   from 'react';
import { ToastContainerProps } from 'react-toastify/dist/types';

const StyledT721ToastContainer: React.FC<ToastContainerProps> = styled(ToastContainer)`
    .Toastify__toast--info {
        background: ${props => props.theme.primaryColorGradientEnd.hex};
    }

    .Toastify__toast--success {
        background: ${props => props.theme.successColor.hex};
    }

    .Toastify__toast--warning {
        background: ${props => props.theme.warningColor.hex};
    }

    .Toastify__toast--error {
        background: ${props => props.theme.errorColor.hex};
    }
`;

export const T721ToastContainer = () => <StyledT721ToastContainer limit={3} position={'top-center'} />;
