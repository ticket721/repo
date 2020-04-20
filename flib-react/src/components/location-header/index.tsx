import * as React from 'react';
import styled from '../../config/styled';
import Icon from '../icon';

export interface LocationHeaderProps extends React.ComponentProps<any> {
  title: string;
  location: string;
  mainColor?: string;
}

const Container = styled.div`
  background-color: #120F1A;
  content: "";
  display: block;
  height: 2px;
  width: 100%;
`

export const LocationHeader: React.FunctionComponent<LocationHeaderProps> = (props: LocationHeaderProps): JSX.Element => {
  return <Container>
          <label>{props.title}</label>

          <h3 className="row"><Icon fill={props.mainColor} icon="location" height="20" width="20" />{props.location}</h3>
        </Container>
};

LocationHeader.defaultProps = {
  mainColor: '#079CF0'
}

export default LocationHeader;
