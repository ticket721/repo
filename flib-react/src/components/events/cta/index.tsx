import * as React from 'react';
import styled from '../../../../config/styled';
import Button from '../../button';

export interface EventCtaProps extends React.ComponentProps<any> {
  ctaLabel: string;
  title: string;
  priceRange: string;
  show?: boolean;
  gradients?: string[];
  onClick: () => void;
}

const CtaContainer = styled.div<EventCtaProps>`
  align-items: center;
  background-color: rgba(33, 29, 45, 0.6);
  backdrop-filter: blur(40px);
  border-top-left-radius: ${props => props.theme.bigRadius};
  border-top-right-radius: ${props => props.theme.bigRadius};
  bottom: 0;
  display: flex;
  font-size: 14px;
  font-weight: 500;
  justify-content: center;
  left: 0;
  opacity: 0;
  padding: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};
  position: fixed;
  transform: translateY(100%);
  transition: transform 300ms ease, opacity 450ms ease;
  width: 100%;
  z-index: 100;

  ${props => props.show &&`
    opacity: 1;
    transform: translateY(0%);
  `}

  h4 {
    color: ${props => props.theme.textColorDarker};
    margin-bottom: ${props => props.theme.smallSpacing};
  }

  div {
    padding-right: 8px;
  }

  button {
    margin: 0;
  }

  & * {
    flex: 1;
  }
`

export const EventCta: React.FunctionComponent<EventCtaProps> = (props: EventCtaProps): JSX.Element => {
  return <CtaContainer show={props.show}>
          <div>
            <h4 className="uppercase">{props.title}</h4>
            <span>{props.priceRange}</span>
          </div>
          <Button title={props.ctaLabel} type="custom" gradients={props.gradients} onClick={props.onClick} />
        </CtaContainer>
}

EventCta.defaultProps = {
  gradients: ['#079CF0', '#2143AB']
}

export default EventCta;
