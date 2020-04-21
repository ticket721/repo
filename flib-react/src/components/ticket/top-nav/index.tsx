import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../../components/icon';

export interface TopNavProps extends React.ComponentProps<any> {
  handleClick?: () => void;
  label: string;
  prevLink?: string;
  scrolled?: boolean;
  showSubNav?: boolean;
  subNav?: SubNavObject[];
}

interface SubNavObject{
  label: string;
  id: string | number;
  to: string
}

const Container = styled.div`
  align-items: center;
  background-color: transparent;
  display: flex;
  flex: 0 0 1;
  font-size: 14px;
  font-weight: 500;
  justify-content: center;
  left: 0;
  padding: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};
  position: fixed;
  transition: background-color 300ms ease;
  top: 0;
  width: 100%;
  z-index: 1000;

  span {
    margin: auto;
  }

  &.scrolled {
    background-color: rgba(33, 29, 45, 0.6);
    backdrop-filter: blur(40px);
  }
`

const SubnavContainer = styled.div`
  cursor: pointer;
  position: relative;
`

const Subnav = styled.nav`
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  padding: ${props => props.theme.regularSpacing};
  position: absolute;
  right: 0;
  top: ${props => props.theme.regularSpacing};

  a {
    display: block;
    margin-bottom: ${props => props.theme.smallSpacing};
    white-space: nowrap;

    &:last-of-type {
      margin: 0 0 0;
    }
  }
`

const IconDots = styled(Icon)`
  height: 4px;
`

export const TopNav: React.FunctionComponent<TopNavProps> = (props: TopNavProps): JSX.Element => {

  return <Container className={props.scrolled ? 'scrolled' : ''}>
          <Icon icon="arrow" fill="rgba(255, 255, 255, 0.9)" height="16" width="16" />
          <span>{props.label}</span>
          {props.subNav?.length &&
            <SubnavContainer onClick={props.handleClick}>
              <IconDots icon="dots" fill="rgba(255, 255, 255, 0.9)" height="4" width="18" />
              {props.showSubNav &&
                <Subnav>
                  {props.subNav.map(el => {
                    return <a key={el.id} href={el.to}>{el.label}</a>
                  })}
                </Subnav>
              }
            </SubnavContainer>
          }
        </Container>
};

export default TopNav;
