import * as React from 'react';
import styled from '../../../config/styled';

export interface CardContainerProps extends React.ComponentProps<any> {
  removeBg?: boolean;
}

const Container = styled.section<CardContainerProps>`
  ${props => !props.removeBg &&`
    background-image: linear-gradient(180deg, ${props.theme.componentGradientStart}, ${props.theme.componentGradientStart});
  `}
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 500;
  padding: ${props => props.theme.biggerSpacing};
  position: relative;
  z-index: 100;
`;

export const CardContainer: React.FunctionComponent<CardContainerProps & {className?: string}> = (props: CardContainerProps): JSX.Element => {

  return <Container className={props.className} removeBg={props.removeBg}>
          {props.children}
        </Container>
};

export default CardContainer;
