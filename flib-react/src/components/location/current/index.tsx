import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface CurrentLocationProps extends React.ComponentProps<any> {
  label: string;
  getCurrentLocation: () => void;
}


const Item = styled.li`
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  display : flex;
  font-size: 14px;
  font-weight: 500;
  padding: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};
  transition: background-color 300ms ease;
  width: 100%;
`

const LocationIcon = styled(Icon)`
  margin-right: ${props => props.theme.smallSpacing};
  position: relative;
  top: -2px;
`

const ChevronIcon = styled(Icon)`
  height: 12px;
  margin-left: ${props => props.theme.smallSpacing};
`

export const CurrentLocation: React.FunctionComponent<CurrentLocationProps> = (props: CurrentLocationProps): JSX.Element => {
  return <Item onClick={props.getCurrentLocation}>
          <LocationIcon icon="location" height="16" width="16" fill="rgba(255, 255, 255, 0.38)" />
          {props.label}
          <ChevronIcon icon="chevron" height="12" width="7" fill="rgba(255, 255, 255, 0.9)"/>
        </Item>
};

CurrentLocation.defaultProps = {
  mainColor: '#079CF0'
}

export default CurrentLocation;
