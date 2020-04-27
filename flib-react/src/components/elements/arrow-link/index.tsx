import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../../components/icon';

export interface ArrowLinkProps extends React.ComponentProps<any> {
  image?: string;
  label: string;
  to: string;
  location?: string;
}

const LinkContainer = styled.div`
  align-items: center;
  appearance: none;
  background-color: ${props => props.theme.darkBg};
  display: inline-flex;
  justify-content: space-between;
  margin: 0 auto;
  padding: ${props => props.theme.biggerSpacing};
  font-size: 15px;
  font-weight: 500;
  position: relative;
  width: 100%;

  &::after {
    background-color: ${props => props.theme.componentColorLight};
    bottom: 0;
    content: "";
    display: block;
    height: 1px;
    left: 0;
    position: absolute;
    width: calc(100% - 24px);
  }

  &:last-of-type::after{
    display: none;
  }

  img {
    box-shadow: 0px 2px 28px rgba(0, 0, 0, 0.2);
    margin-right: ${props => props.theme.regularSpacing};
  }
`

const Arrow = styled(Icon)`
  fill: ${props => props.theme.textColor};
  transform: rotate(180deg);
`

const LocationContainer = styled.div`
  align-items: center;
  display: flex;

  svg:first-of-type {
    position: relative;
    top: -2px;
  }

  span {
    margin: 0 ${props => props.theme.smallSpacing};
  }
`

export const ArrowLink: React.FunctionComponent<ArrowLinkProps & {className?: string}> = (props:ArrowLinkProps): JSX.Element => {
  // TODO -- Update to use link from react-router
  return <LinkContainer>
            <span>{props.label}</span>
            {props.location ? (
              <LocationContainer>
                <Icon icon="location" height="16" width="16" />
                <span>{props.location}</span>
                <Icon icon="chevron" height="12" width="8" fill="rgba(255, 255, 255, 0.9)" />
              </LocationContainer>
            ) : (
              <Arrow icon="arrow" height="16" width="16" />
            )}
          </LinkContainer>
};

export default ArrowLink;
