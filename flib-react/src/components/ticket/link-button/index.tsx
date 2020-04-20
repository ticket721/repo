import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../../components/icon';

export interface LinkProps extends React.ComponentProps<any> {
  image?: string;
  label: string;
  to: string;
}

const LinkContainer = styled.div`
  align-items: center;
  appearance: none;
  background-color: ${props => props.theme.componentColorLighter};
  backdrop-filter: blur(4px);
  border-radius: ${props => props.theme.defaultRadius};
  display: inline-flex;
  justify-content: space-between;
  margin: 0 auto;
  padding: ${props => props.theme.regularSpacing};
  font-size: 15px;
  font-weight: 500;
  width: 100%;
  img {
    box-shadow: 0px 2px 28px rgba(0, 0, 0, 0.2);
    margin-right: ${props => props.theme.regularSpacing};
  }
`

export const LinkButton: React.FunctionComponent<LinkProps> = (props:LinkProps, className): JSX.Element => {
  // TODO -- Update to use link from react-router
  return <LinkContainer>
            <div className="row aic">
            {props.image &&
              <img src={props.image} />
            }
            <span>{props.label}</span>
            </div>
            <Icon icon='chevron' height="12" width="7" fill="rgba(255, 255, 255, 0.9)"/>
          </LinkContainer>
};

export default LinkButton;
