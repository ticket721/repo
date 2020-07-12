import * as React from 'react';
import styled     from '../../../config/styled';
import { detect } from 'detect-browser';
import Button     from '../../button';

const browser = detect();

export interface DoubleButtonCtaProps extends React.ComponentProps<any> {
  secondaryLabel: string;
  ctaLabel: string;
  variant?: string;
  show?: boolean;
  loading?: boolean;
  gradients?: string[];
  onClick: () => void;
  onSecondaryClick: () => void;
}

const CtaContainer = styled.div<DoubleButtonCtaProps>`
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
  justify-content: space-around;
  left: 0;
  opacity: 0;
  padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
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

  button {
    margin: 0;
  }
`;

const ButtonWrapper = styled.div`
    width: 70%;
`;

const TextButton = styled.p`
  text-decoration: underline;
  color: ${props => props.theme.errorColor.hex};
  opacity: 0.8;
`;

export const DoubleButtonCta: React.FunctionComponent<DoubleButtonCtaProps & { className?: string }> = (
  props: DoubleButtonCtaProps,
): JSX.Element => {
  return (
    <CtaContainer show={props.show} className={props.className}>
      <TextButton onClick={props.onSecondaryClick} >{props.secondaryLabel}</TextButton>
      <ButtonWrapper>
        <Button
          loadingState={props.loading}
          title={props.ctaLabel}
          variant={props.loading ? 'disabled' : ((props.variant as any) || 'custom')}
          gradients={props.gradients}
          onClick={props.loading ? undefined : props.onClick}
        />
      </ButtonWrapper>
    </CtaContainer>
  );
};

DoubleButtonCta.defaultProps = {
  gradients: ['#079CF0', '#2143AB'],
};

export default DoubleButtonCta;
