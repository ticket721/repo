import * as React from 'react';
import styled from '../../../config/styled';
import { detect } from 'detect-browser';
import Button from '../../button';

const browser = detect();

export interface EventCtaProps extends React.ComponentProps<any> {
  ctaLabel: string;
  title: string;
  subtitle: string;
  show?: boolean;
  gradients?: string[];
  onClick: () => void;
}

const CtaContainer = styled.div<EventCtaProps>`
  align-items: center;
  background-color: ${browser?.name === 'firefox' ? 'rgba(33, 29, 45, 0.95)' : 'rgba(33, 29, 45, 0.6)'};

  ${browser?.name !== 'firefox' &&`
    backdrop-filter: blur(40px);
  `}

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
  transition: all 300ms ease, opacity 450ms ease;
  width: 100%;
  z-index: 100;

  ${props => props.show &&`
    opacity: 1;
    transform: translateY(0%);
  `}

  h4 {
    color: ${browser?.name === 'firefox' ? '#9a989a' : props => props.theme.textColorDarker};
    margin-bottom: ${props => props.theme.smallSpacing};
  }

  div {
    padding-right: 48px;
  }

  button {
    margin: 0;
    & * {
      flex: 2;
    }
  }
`

export const EventCta: React.FunctionComponent<EventCtaProps & {className?: string}> = (props: EventCtaProps): JSX.Element => {
  return <CtaContainer show={props.show} className={props.className}>
          <div>
            <h4 className="uppercase">{props.title}</h4>
            <span>{props.subtitle}</span>
          </div>
          <Button title={props.ctaLabel} type="custom" gradients={props.gradients} onClick={props.onClick} />
        </CtaContainer>
}

EventCta.defaultProps = {
  gradients: ['#079CF0', '#2143AB']
}

export default EventCta;
