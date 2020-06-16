import * as React from 'react';
import Separator from '../../../elements/separator';
import CardContainer from '../../../elements/card-container';
import styled from '../../../../config/styled';
import Icon from '../../../icon';

export interface TitleTextProps extends React.ComponentProps<any> {
    removeBg?: boolean;
    small?: boolean;
    text: string;
    title?: string;
    icon?: string;
    iconSize?: string;
    wSeparator?: boolean;
}

const H3 = styled.h3`
    margin-bottom: ${(props) => props.theme.smallSpacing};
    width: 100%;
`;
const TitleIcon = styled(Icon)`
    margin-bottom: ${(props) => props.theme.smallSpacing};
    margin-right: 12px;
`;
const Text = styled.p`
    color: ${(props) => props.theme.textColorDark};
    width: 100%;
`;

export const TitleText: React.FunctionComponent<TitleTextProps> = (props: TitleTextProps): JSX.Element => {
    return (
        <CardContainer removeBg={props.removeBg} small={props.small}>
            <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
                {props.icon && <TitleIcon icon={props.icon} size={props.iconSize || '14px'} />}
                {props.title && <H3>{props.title}</H3>}
            </span>
            <Text>{props.text}</Text>
            {props.wSeparator && <Separator />}
        </CardContainer>
    );
};

export default TitleText;
