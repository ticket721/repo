import * as React from 'react';
import CardContainer from '../../elements/card-container';
import Icon from '../../icon';
import styled from '../../../config/styled';

export interface DescriptionLinkProps extends React.ComponentProps<any> {
  removeBg?: boolean;
  text: string;
  subtitle?: string;
  title: string;
  link?: string;
}

const H3 = styled.h3`
  margin-bottom: ${props => props.theme.smallSpacing};
  width: 100%;
`
const Text = styled.p<DescriptionLinkProps>`
  color: ${props => props.theme.textColorDark};
  width: 100%;
`
const Subtitle = styled.h4`
  color: ${props => props.theme.textColorDarker};
  margin-bottom: ${props => props.theme.regularSpacing};
`;

const Content = styled.div`
  width: 80%;
`

export const DescriptonLink: React.FunctionComponent<DescriptionLinkProps> = (props: DescriptionLinkProps): JSX.Element => {

  return <CardContainer removeBg={props.removeBg}>
              <div className="row aic jcsb">
              <Content>
                {props.subtitle &&
                  <Subtitle className="uppercase">{props.subtitle}</Subtitle>
                }
                <H3>{props.title}</H3>
                <Text>{props.text}</Text>
              </Content>
                 {/* UPDATE TO USE router-link */}
              {props.link &&
                <a href={props.link}><Icon icon="rightArrow" height="16" width="16" fill="rgba(255, 255, 255, 0.9)" /></a>
              }
            </div>
        </CardContainer>
};

export default DescriptonLink;
