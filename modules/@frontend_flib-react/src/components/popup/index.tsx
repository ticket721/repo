import React from 'react';
import styled from 'styled-components';

export const Popup: React.FC<React.ComponentProps<any>> = ({ children }) => (
    <PopupWrapper>
        <PopupContent>{children}</PopupContent>
    </PopupWrapper>
);

const PopupWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    z-index: 3;
    background-color: rgba(0, 0, 0, 0.4);
`;

const PopupContent = styled.div`
    display: flex;
    flex-direction: column;
    width: 450px;
    padding: ${(props) => `${props.theme.doubleSpacing} ${props.theme.biggerSpacing} ${props.theme.smallSpacing}`};
    box-shadow: 0 0 5px #120f1a;
    background-color: #241f33;
    border-radius: ${(props) => props.theme.defaultRadius};
`;
