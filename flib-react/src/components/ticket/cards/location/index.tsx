import * as React from 'react';
import styled from '../../../../../config/styled';
import Icon from '../../../icon';

export interface LocationCardProps extends React.ComponentProps<any> {
  location: string;
  address: string;
  iconColor?: string;
  link?: string;
  linkLabel?: string;
}

const Container = styled.div`
  display: flex;
  font-size: 14px;
  font-weight: 500;
  padding: 12px ${props => props.theme.biggerSpacing};

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
    margin-right: ${props => props.theme.regularSpacing};
  }
`;

export const LocationCard: React.FunctionComponent<LocationCardProps> = (props: LocationCardProps): JSX.Element => {

  return <Container>
            <Icon icon='location' fill={props.iconColor} width='12' height='16' />
            <div className="column">
              <span>{props.location}</span>
              <span>{props.address}</span>
            </div>
        </Container>
};

export default LocationCard;
