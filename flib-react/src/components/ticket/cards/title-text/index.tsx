import * as React from 'react';
import Separator from '../../../elements/separator';
import CardContainer from '../../../elements/card-container';
import styled from '../../../../../config/styled';

export interface TitleTextProps extends React.ComponentProps<any> {
  title: string;
  removeBg?: boolean;
  text: string;
  wSeparator?: boolean;
}

const H3 = styled.h3`
  margin-bottom: ${props => props.theme.smallSpacing};
  width: 100%;
`
const Text = styled.p`
  color: ${props => props.theme.textColorDark};
`

export const TitleText: React.FunctionComponent<TitleTextProps> = (props: TitleTextProps): JSX.Element => {

  return <CardContainer removeBg={props.removeBg}>
           <H3>{props.title}</H3>
           <Text>{props.text}</Text>

            {props.wSeparator &&
              <Separator />
            }
        </CardContainer>
};

export default TitleText;
