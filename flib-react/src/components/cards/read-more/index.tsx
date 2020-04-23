import * as React from 'react';
import Separator from '../../elements/separator';
import CardContainer from '../../elements/card-container';
import styled from '../../../config/styled';

export interface ReadMoreProps extends React.ComponentProps<any> {
  removeBg?: boolean;
  readMoreColor?: string;
  showLabel: string;
  hideLabel: string;
  text: string;
  wSeparator?: boolean;
}

const H3 = styled.h3`
  margin-bottom: ${props => props.theme.regularSpacing};
  width: 100%;
`
const Text = styled.p<ReadMoreProps>`
  color: ${props => props.theme.textColorDark};
  max-height: ${props => props.showText ? '500px': '78px'};
  overflow: hidden;
  transition: max-height 300ms ease;
  width: 100%;
`

const ReadMoreLabel = styled.span<ReadMoreProps>`
  color: ${props => props.readMoreColor ? props.readMoreColor : props.theme.primaryColor};
  cursor: pointer;
  font-weight: 500;
  margin-top: ${props => props.theme.regularSpacing};
`

export const ReadMore: React.FunctionComponent<ReadMoreProps> = (props: ReadMoreProps): JSX.Element => {
  const [show, setShow] = React.useState(false);

  return <CardContainer removeBg={props.removeBg}>
            <H3>{props.title}</H3>
            <Text showText={show}>{props.text}</Text>
            {props.text.length > 180 &&
              <ReadMoreLabel onClick={() => setShow(!show)} readMoreColor={props.readMoreColor}>
                {show ? props.hideLabel : props.showLabel}
              </ReadMoreLabel>
            }
            {props.wSeparator &&
              <Separator />
            }
        </CardContainer>
};

export default ReadMore;
