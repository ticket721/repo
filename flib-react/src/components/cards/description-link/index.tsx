import * as React from 'react';
import Separator from '../../elements/separator';
import CardContainer from '../../elements/card-container';
import styled from '../../../../config/styled';

export interface DescriptionLinkProps extends React.ComponentProps<any> {
  removeBg?: boolean;
  text: string;
  subtile?: string;
  title: string;
  wSeparator?: boolean;
}

const H3 = styled.h3`
  margin-bottom: ${props => props.theme.regularSpacing};
  width: 100%;
`
const Text = styled.p<DescriptionLinkProps>`
  color: ${props => props.theme.textColorDark};
  width: 100%;
`


export const DescriptonLink: React.FunctionComponent<DescriptionLinkProps> = (props: DescriptionLinkProps): JSX.Element => {

  return <CardContainer removeBg={props.removeBg}>
            <H3>{props.title}</H3>
            <Text>{props.text}</Text>

            {props.wSeparator &&
              <Separator />
            }
        </CardContainer>
};

export default DescriptonLink;
