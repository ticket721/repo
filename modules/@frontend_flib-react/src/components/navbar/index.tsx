import * as React from 'react';
import styled from '../../config/styled';

interface StyledNavbar {
    visible: boolean;
    iconHeight: string;
}

const StyledNavbar = styled.nav<StyledNavbar>`
    align-items: center;

    background-color: rgba(33, 29, 45, 1);
    @supports ((-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))) {
        background-color: rgba(33, 29, 45, 0.6);
        backdrop-filter: blur(6px);
    }
    border-top-left-radius: ${(props) => props.theme.doubleSpacing};
    border-top-right-radius: ${(props) => props.theme.doubleSpacing};
    transition: bottom 500ms ease;
    bottom: ${(props) =>
        props.visible
            ? '0'
            : `calc(-${props.theme.regularSpacing} * 3 - env(safe-area-inset-bottom) - ${props.iconHeight})`};
    display: flex;
    justify-content: space-between;
    left: 0;
    padding: calc(${(props) => props.theme.regularSpacing} * 1.5) ${(props) => props.theme.doubleSpacing};
    padding-bottom: calc(${(props) => props.theme.regularSpacing} * 1.5 + env(safe-area-inset-bottom));
    padding-bottom: calc(${(props) => props.theme.regularSpacing} * 1.5 + constant(safe-area-inset-bottom));
    position: fixed;
    width: 100%;
    z-index: 9999;

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
            {props.children}
        </StyledNavbar>
    );
};

export default Navbar;
