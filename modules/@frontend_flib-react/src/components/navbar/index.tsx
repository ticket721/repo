import * as React from 'react';
import styled from '../../config/styled';
import { injectBlur } from '../../utils/blur';

interface StyledNavbar {
    visible: boolean;
    iconHeight: string;
}

const StyledNavbar = styled.nav<StyledNavbar>`
    ${injectBlur('rgba(33, 29, 45, 0.2)', 'rgba(33, 29, 45, 1)')};

    border-radius: ${(props) => props.theme.doubleSpacing};
    transition: bottom 500ms ease;
    bottom: ${(props) =>
        props.visible
            ? 'calc(env(safe-area-inset-bottom) + 2%)'
            : `calc(-${props.theme.regularSpacing} * 3 - env(safe-area-inset-bottom) - ${props.iconHeight} - 2%)`};
    left: 2%;
    padding: calc(${(props) => props.theme.regularSpacing} * 1.5) ${(props) => props.theme.doubleSpacing};
    position: fixed;
    width: 96%;
    z-index: 9999;
    align-items: center;
    display: flex;
    justify-content: center;
    border: 1px solid #cccccc07;
`;

const ContentContainer = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    width: 100%;

    @media screen and (min-width: 900px) {
        width: 500px;
    }

    a {
        align-items: center;
        color: #fff;
        display: inline-flex;
        opacity: 0.6;
        position: relative;
        text-decoration: none;
        transition: opacity 300ms ease;
        z-index: 9999;

        &:hover {
            opacity: 1;
        }

        &.active {
            opacity: 1;

            &::after {
                background-color: ${(props) => props.theme.primaryColor.hex};
                border-radius: 100%;
                bottom: -1rem;
                content: '';
                display: block;
                height: 4px;
                left: 0;
                margin: auto;
                position: absolute;
                right: 0;
                width: 4px;
            }
        }
    }
`;

export interface NavbarProps {
    visible: boolean;
    iconHeight: string;
}

export const Navbar: React.FunctionComponent<NavbarProps> = (props): JSX.Element => {
    return (
        <StyledNavbar visible={props.visible} iconHeight={props.iconHeight}>
            <ContentContainer>{props.children}</ContentContainer>
        </StyledNavbar>
    );
};

export default Navbar;
