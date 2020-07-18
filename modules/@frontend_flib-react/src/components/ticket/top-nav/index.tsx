import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../../components/icon';

export interface TopNavProps extends React.ComponentProps<any> {
    handleClick?: () => void;
    label: string;
    prevLink?: string;
    scrolled?: boolean;
    showSubNav?: boolean;
    subNav?: SubNavObject[];
    onPress?: () => void;
    visible?: boolean;
}

interface SubNavObject {
    label: string;
    id: string | number;
    to: string;
}

interface SafeOffsetContainerProps {
  visible: boolean;
}

const SafeOffsetContainer = styled.div<SafeOffsetContainerProps>`
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
    top: ${props => props.visible ? 0 : 'calc(-48px - constant(safe-area-inset-top))'};
    top: ${props => props.visible ? 0 : 'calc(-48px - env(safe-area-inset-top))'};
    transition: backdrop-filter 300ms ease, top 500ms ease;
    height: calc(48px + constant(safe-area-inset-top));
    height: calc(48px + env(safe-area-inset-top));
    width: 100%;
    z-index: 9999;

    &.scrolled {
        background-color: rgba(0, 0, 0, 0);
        backdrop-filter: blur(16px);
    }
`;

interface ContainerProps {
  visible: boolean;
}

const Container = styled.div<ContainerProps>`
    align-items: center;
    background-color: transparent;
    display: flex;
    flex: 0 0 1;
    font-size: 14px;
    font-weight: 500;
    justify-content: space-between;
    left: 0;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
    top: ${props => props.visible ? 'constant(safe-area-inset-top)' : 'calc(-48px - constant(safe-area-inset-top))'};
    top: ${props => props.visible ? 'env(safe-area-inset-top)' : 'calc(-48px - env(safe-area-inset-top))'};
    transition: top 500ms ease;
    position: fixed;
    width: 100%;
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

export const TopNav: React.FunctionComponent<TopNavProps> = (props: TopNavProps): JSX.Element => {
    const [showSub, setshowSub] = React.useState(false);

    return (
        <SafeOffsetContainer className={props.scrolled ? 'scrolled' : ''} visible={!!props.visible}>
            <Container visible={!!props.visible}>
                <a onClick={props.onPress}>
                    <Icon icon={'back-arrow'} size={'16px'} color={'rgba(255, 255, 255, 0.9)'} />
                </a>
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
