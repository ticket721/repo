import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface LocationHeaderProps extends React.ComponentProps<any> {
  title: string;
  location: string;
  mainColor?: string;
}

const Container = styled.section`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing} 0;
  width: 100%;

  h4 {
    color: ${props => props.theme.textColorDark};
    font-size: 13px;
    margin-bottom: 4px;
  }
`

const LocationIcon = styled(Icon)`
  margin-right: ${props => props.theme.smallSpacing};
`

export const LocationHeader: React.FunctionComponent<LocationHeaderProps> = (props: LocationHeaderProps): JSX.Element => {
  return <Container>
          <div>
            <h4>{props.title}</h4>
            <h3 className="row"><LocationIcon fill={props.mainColor} icon="location" height="16" width="16" />{props.location}</h3>
          </div>
          <button type="button"><Icon icon="filter" height="16" width="16" fill="rgba(255, 255, 255, 0.9)" /></button>
        </Container>
};

LocationHeader.defaultProps = {
  mainColor: '#079CF0'
}

export default LocationHeader;
