import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../../components/icon';

export interface ArrowLinkProps extends React.ComponentProps<any> {
    image?: string;
    label: string;
    location?: string;
    onClick?: () => void;
    badged?: boolean;
}

const LinkContainer = styled.div`
    align-items: center;
    appearance: none;
    background-color: ${(props) => props.theme.darkBg};
    display: inline-flex;
    justify-content: space-between;
    margin: 0 auto;
    padding: ${(props) => props.theme.biggerSpacing};
    font-size: 15px;
    font-weight: 500;
    position: relative;
    width: 100%;

    &::after {
        background-color: ${(props) => props.theme.componentColorLight};
        bottom: 0;
        content: '';
        display: block;
        height: 1px;
        left: 0;
        position: absolute;
        width: calc(100% - 24px);
    }

    &:last-of-type::after {
        display: none;
    }

    img {
        box-shadow: 0px 2px 28px rgba(0, 0, 0, 0.2);
        margin-right: ${(props) => props.theme.regularSpacing};
    }
`;

const Arrow = styled(Icon)`
    fill: ${(props) => props.theme.textColor};
`;

const Chevron = styled(Icon)`
    fill: ${(props) => props.theme.textColor};
    transform: rotate(270deg);
`;

const LocationContainer = styled.div`
    align-items: center;
    display: flex;

    svg:first-of-type {
        position: relative;
        top: -2px;
    }

    span {
        margin: 0 ${(props) => props.theme.smallSpacing};
    }
`;

const IconContainer = styled.div`
    span {
        margin: 0 ${(props) => props.theme.smallSpacing};
    }
`;

const Badge = styled.div`
    border-radius: 50%;
    width: ${(props) => props.theme.smallSpacing};
    height: ${(props) => props.theme.smallSpacing};
    background-color: ${(props) => props.theme.badgeColor.hex};
    margin-left: ${(props) => props.theme.smallSpacing};
`;

export const ArrowLink: React.FunctionComponent<ArrowLinkProps & { className?: string }> = (
    props: ArrowLinkProps,
): JSX.Element => {
    // TODO -- Update to use link from react-router
    return (
        <LinkContainer onClick={props.onClick} style={{ cursor: props.onClick ? 'pointer' : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <span>{props.label}</span>
                {props.badged ? <Badge /> : null}
            </div>
            {props.location ? (
                <LocationContainer>
                    <Icon icon={'location'} size={'16px'} />
                    <span>{props.location}</span>
                    <Chevron icon={'chevron'} size={'9px'} color={'rgba(255, 255, 255, 0.9)'} />
                </LocationContainer>
            ) : (
                <IconContainer>
                    <Arrow icon={'arrow'} size={'16px'} color={'rgba(255, 255, 255, 0.9)'} />
                </IconContainer>
            )}
        </LinkContainer>
    );
};

export default ArrowLink;
