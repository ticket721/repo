import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../../components/icon';
import { injectBlur } from '../../../utils/blur';

export interface LinkProps extends React.ComponentProps<any> {
    image?: string;
    label: string;
    to: string;
}

const LinkContainer = styled.div`
    align-items: center;
    appearance: none;
    ${(props) => injectBlur('rgba(33, 29, 45, 0.2)', props.theme.componentColorLighter)};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: inline-flex;
    justify-content: space-between;
    margin: 0 auto;
    padding: ${(props) => props.theme.regularSpacing};
    font-size: 15px;
    font-weight: 500;
    width: 100%;

    img {
        box-shadow: 0px 2px 28px rgba(0, 0, 0, 0.2);
        margin-right: ${(props) => props.theme.regularSpacing};
    }
`;

export const LinkButton: React.FunctionComponent<LinkProps> = (props: LinkProps, className): JSX.Element => {
    // TODO -- Update to use link from react-router
    return (
        <LinkContainer>
            <div className={'row aic'}>
                {props.image && <img src={props.image} />}
                <span>{props.label}</span>
            </div>
            <Icon icon={'chevron'} size={'12px'} color={'rgba(255, 255, 2555, 0.9)'} />
        </LinkContainer>
    );
};

export default LinkButton;
