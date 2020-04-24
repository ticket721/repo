import * as React from 'react';
import styled from '../../../config/styled';
import slugify from 'slugify';
import Icon from '../../icon';

export interface LocationListProps extends React.ComponentProps<any> {
  title: string;
  locations: string[];
  mainColor?: string;
  selectedLocation?: string;
  updateLocation: (location: string) => void;
}

const Container = styled.section`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  h2 {
    padding: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing} ${props => props.theme.smallSpacing};
  }
`

const LocationIcon = styled(Icon)`
  margin-right: ${props => props.theme.smallSpacing};
  position: relative;
  top: -1px;
`

const CheckIcon = styled(Icon)`
  height: 12px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 300ms ease;
`

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

  &.selected {
    background-color: ${props => props.theme.componentColorLight};

    ${CheckIcon} {
      opacity: 1;
    }
  }
`

export const LocationList: React.FunctionComponent<LocationListProps> = (props: LocationListProps): JSX.Element => {
  return <Container>
            <h2>{props.title}</h2>
            <ul className="row">
              {props.locations.map(location => {
                return  <Item key={slugify(location)} className={location === props.selectedLocation ? 'selected': ''} onClick={() =>{ return props.updateLocation(location) }}>
                          <LocationIcon icon="pin" height="16" width="16" fill="rgba(255, 255, 255, 0.38)" />
                          {location}
                          <CheckIcon icon="check" height="12" width="16" fill="rgba(255, 255, 255, 0.38)" />
                        </Item>
              })}
            </ul>
        </Container>
};

LocationList.defaultProps = {
  mainColor: '#079CF0'
}

export default LocationList;
