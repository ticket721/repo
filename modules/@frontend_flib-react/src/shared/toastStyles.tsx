import { ToastContainer } from 'react-toastify';
import styled from '../config/styled';
import React from 'react';
import { ToastContainerProps } from 'react-toastify/dist/types';
import { useMediaQuery } from 'react-responsive';

interface IStylesT721ToastContainerInputProps {
    mobile: boolean;
}

const StyledT721ToastContainer: React.FC<ToastContainerProps & IStylesT721ToastContainerInputProps> = styled(
    ToastContainer,
)`
    top: ${(props: IStylesT721ToastContainerInputProps) => (props.mobile ? '48px' : '24px')};
`;

export const T721ToastContainer = () => {
    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });

    return <StyledT721ToastContainer mobile={isTabletOrMobile} limit={3} position={'top-center'} />;
};
