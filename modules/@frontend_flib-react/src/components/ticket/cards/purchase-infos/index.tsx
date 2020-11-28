import * as React from 'react';
import styled from '../../../../config/styled';
import CardContainer from '../../../elements/card-container';
import Separator from '../../../elements/separator';
import Icon from '../../../icon';

export interface PurchaseInfosCardProps extends React.ComponentProps<any> {
    date: string;
    iconColor: string;
    price: string;
    purchasedLabel: string;
    priceLabel: string;
    removeBg?: boolean;
    wSeparator?: boolean;
    wBottomLeftRadius?: boolean;
}

const IconContainer = styled.div`
    position: relative;
    margin-right: ${(props) => props.theme.regularSpacing};
    top: -3px;
`;

const Info = styled.span`
    color: ${(props) => props.theme.textColorDark};
    display: block;
    margin-top: 8px;
`;

const Label = styled.label`
    color: ${(props) => props.theme.textColor};
    display: block;
    padding: 0 ${(props) => props.theme.doubleSpacing} 0 0;
`;

export const PurchaseInfosCard: React.FunctionComponent<PurchaseInfosCardProps> = (
    props: PurchaseInfosCardProps,
): JSX.Element => {
    return (
        <CardContainer removeBg={props.removeBg} wBottomLeftRadius={props.wBottomLeftRadius}>
            <IconContainer>
                <Icon icon={'ticket'} size={'18px'} color={props.iconColor} />
            </IconContainer>
            <div>
                <Label>{props.purchasedLabel}</Label>
                <Info>{props.date}</Info>
            </div>
            <div>
                <Label>{props.priceLabel}</Label>
                <Info>{props.price}</Info>
            </div>
            {props.wSeparator && <Separator />}
        </CardContainer>
    );
};

export default PurchaseInfosCard;
