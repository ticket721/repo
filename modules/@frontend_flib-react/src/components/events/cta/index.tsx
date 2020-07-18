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
  disabled?: boolean;
  onClick: () => void;
}

const CtaContainer = styled.div<EventCtaProps>`
  align-items: center;
  background-color: ${browser?.name === 'firefox' ? 'rgba(33, 29, 45, 0.95)' : 'rgba(33, 29, 45, 0.6)'};

  ${
  browser?.name !== 'firefox' &&
  `
    backdrop-filter: blur(40px);
  `
}

  border-top-left-radius: ${(props) => props.theme.bigRadius};
  border-top-right-radius: ${(props) => props.theme.bigRadius};
  bottom: 0;
  display: flex;
  font-size: 14px;
  font-weight: 500;
  justify-content: center;
  left: 0;
  opacity: 0;
  padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
  padding-bottom: calc(${(props) => props.theme.regularSpacing} + env(safe-area-inset-bottom));
  padding-bottom: calc(${(props) => props.theme.regularSpacing} + constant(safe-area-inset-bottom));
  position: fixed;
  transform: translateY(100%);
  transition: all 300ms ease, opacity 450ms ease;
  width: 100%;
  z-index: 9999;

  ${(props) =>
  props.show &&
  `
    opacity: 1;
    transform: translateY(0%);
  `}

  h4 {
    color: ${browser?.name === 'firefox' ? '#9a989a' : (props) => props.theme.textColorDarker};
    margin-bottom: ${(props) => props.theme.smallSpacing};
  }

  div {
    padding-right: 24px;
    width: 50%;
  }

  button {
    margin: 0;
    max-width: 50%;
  }
`;

export const EventCta: React.FunctionComponent<EventCtaProps & { className?: string }> = (
  props: EventCtaProps,
): JSX.Element => {
  return (
    <CtaContainer show={props.show} className={props.className}>
      <div>
        <h4 className={'uppercase'}>{props.title}</h4>
        <span>{props.subtitle}</span>
      </div>
      <Button
        title={props.ctaLabel}
        variant={props.disabled ? 'disabled' : 'custom'}
        gradients={props.gradients}
        onClick={props.onClick}
      />
    </CtaContainer>
  );
};

EventCta.defaultProps = {
  gradients: ['#079CF0', '#2143AB'],
};

export default EventCta;
