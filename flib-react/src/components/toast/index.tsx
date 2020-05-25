import * as React                          from 'react';
import styled                              from '../../config/styled';
import { Icon }                            from '../icon';

export interface ToastProps extends React.ComponentProps<any> {
    kind: 'info' | 'success' | 'error' | 'warning';
    message: string;
}

const Toast = (props: ToastProps) => (
    <ToastContainer>
        <ToastIcon
        icon={props.kind}
        color={'#fff'}
        size={'25px'}/>
        <span>{props.message}</span>
    </ToastContainer>
);

const ToastContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0 10px;
    color: rgba(255, 255, 255, 0.9);
    font-family: ${props => props.theme.fontStack};
    font-size: 14px;
`;

const ToastIcon = styled(Icon)`
    margin-right: 10px;
`;

Toast.defaultProps = {
    kind: 'info',
    message: 'none',
};

export default Toast;





