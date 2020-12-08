import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../../components/icon';
import { injectBlur } from '../../../utils/blur';

export interface TopNavProps extends React.ComponentProps<any> {
    handleClick?: () => void;
    label: string;
    prevLink?: string;
    scrolled?: boolean;
    showSubNav?: boolean;
    subNav?: SubNavObject[];
    onPress?: () => void;
}

interface SubNavObject {
    label: string;
    id: string | number;
    to: string;
}

const SafeOffsetContainer = styled.div`
    align-items: center;
    background-color: transparent;
    display: flex;
    flex: 0 0 1;
    font-size: 14px;
    font-weight: 500;
    justify-content: space-between;
    left: 0;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
    position: fixed;
    top: 0;
    height: calc(48px + constant(safe-area-inset-top));
    height: calc(48px + env(safe-area-inset-top));
    width: 100%;
    z-index: 9999;

    &.scrolled {
        ${injectBlur('rgba(33, 29, 45, 0.2)', 'rgba(33, 29, 45, 1)')};
        border-bottom: 1px solid #cccccc07;
    }
`;

const Container = styled.div`
    align-items: center;
    background-color: transparent;
    display: flex;
    flex: 0 0 1;
    font-size: 14px;
    font-weight: 500;
    justify-content: space-between;
    left: 0;
    padding: ${(props) => props.theme.regularSpacing};
    top: constant(safe-area-inset-top);
    top: env(safe-area-inset-top);
    transition: top 500ms ease;
    position: fixed;
    width: 100%;
    height: 48px;
    z-index: 9999;
`;

const SubnavContainer = styled.div`
    cursor: pointer;
    position: relative;
`;

const Subnav = styled.nav`
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    padding: ${(props) => props.theme.regularSpacing};
    position: absolute;
    right: 0;
    top: ${(props) => props.theme.regularSpacing};

    a {
        display: block;
        margin-bottom: ${(props) => props.theme.smallSpacing};
        white-space: nowrap;

        &:last-of-type {
            margin: 0 0 0;
        }
    }
`;

const IconDots = styled(Icon)`
    height: 4px;
`;

interface BackgroundHidderProps {
    scrolled?: boolean;
}

const BackgroundHidder = styled.div<BackgroundHidderProps>`
    width: 30px;
    height: 30px;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    ${(props) =>
        props.scrolled
            ? `
    background-color: transparent;
  `
            : `
              ${injectBlur('rgba(33, 29, 45, 0.2)', 'rgba(33, 29, 45, 1)')};
              `}
`;

export const TopNav: React.FunctionComponent<TopNavProps> = (props: TopNavProps): JSX.Element => {
    const [showSub, setshowSub] = React.useState(false);

    return (
        <SafeOffsetContainer className={props.scrolled ? 'scrolled' : ''}>
            <Container>
                <BackgroundHidder scrolled={props.scrolled} onClick={props.onPress}>
                    <Icon icon={'back-arrow'} size={'14px'} color={'white'} />
                </BackgroundHidder>
                <span>{props.label}</span>
                <span>
                    {props.subNav?.length && (
                        <SubnavContainer
                            onClick={() => {
                                setshowSub(!showSub);
                            }}
                        >
                            <IconDots icon={'dots'} size={'4px'} color={'rgba(255, 255, 255, 0.9)'} />
                            {showSub && (
                                <Subnav>
                                    {props.subNav.map((el) => {
                                        return (
                                            <a key={el.id} href={el.to}>
                                                {el.label}
                                            </a>
                                        );
                                    })}
                                </Subnav>
                            )}
                        </SubnavContainer>
                    )}
                </span>
            </Container>
        </SafeOffsetContainer>
    );
};

export default TopNav;
