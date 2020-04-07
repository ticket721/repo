import * as React from 'react';
import styled from '../../../../../config/styled';
import Icon from '../../../icon';

export interface PurchaseInfosCardProps extends React.ComponentProps<any> {
  date: string;
  iconColor: string;
  price: string;
  wSeparator?: boolean;
}

const Container = styled.section`
  background-image: linear-gradient(180deg, ${props => props.theme.componentGradientStart}, ${props => props.theme.componentGradientStart});
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 500;
  padding: ${props => props.theme.biggerSpacing};
  overflow: hidden;

  label {
    color: ${props => props.theme.textColor};
    padding: 0;
  }

  span {
    &:first-of-type {
      margin-top: 2px;
    }

    &:last-of-type {
      color: ${props => props.theme.textColorDark};
      margin-top: 8px;
    }
  };

  svg {
    position: relative;
    margin-right: ${props => props.theme.regularSpacing};
    top: -3px;
  }

  .column {
    &:first-of-type {
      padding-right: ${props => props.theme.biggerSpacing};
    }

    &:last-of-type {
      padding-left: ${props => props.theme.biggerSpacing};
    }
  }
`;

const Separator = styled.div`
  background-color: ${props => props.theme.componentColor};
  bottom: 0;
  content: "";
  display: block;
  height: 2px;
  left: 0;
  position: absolute;
  width: 100%;
  z-index: 100;

  &::before,
  &::after {
    background-color: ${props => props.theme.componentGradientEnd};
    content: "";
    display: inline-block;
    height: ${props => props.theme.regularSpacing};
    position: absolute;
    top: -7px;
    transform: rotate(45deg);
    width: ${props => props.theme.regularSpacing};
  }

  &::before {
    left: -8px;
  }

  &::after {
    right: -8px;
  }
`

export const PurchaseInfosCard: React.FunctionComponent<PurchaseInfosCardProps> = (props: PurchaseInfosCardProps): JSX.Element => {

  return <Container>
            <Icon icon='ticket' fill={props.iconColor} width='18' height='18' />
            <div className="column">
              <label>Date purchased</label>
              <span>{props.date}</span>
            </div>
            <div className="column">
              <label>Price</label>
              <span>{props.price}</span>
            </div>
            {props.wSeparator &&
              <Separator />
            }
        </Container>
};

export default PurchaseInfosCard;
