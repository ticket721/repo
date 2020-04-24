import * as React from 'react';
import styled from '../../../config/styled';
import EventCta from '../../events/cta';

export interface WalletNavProps extends React.ComponentProps<any> {
  ctaLabel: string;
  title: string;
  subtitle: string;
  show?: boolean;
  gradients?: string[];
  onClick: () => void;
}

const Container = styled(EventCta)`
  background: none;
  backdrop-filter: none;
  border-radius: 0;
  bottom: unset;
  margin-top: ${props => props.theme.biggerSpacing};
  opacity: 1;
  position: relative;
  transform: none;

  &::before {
    background-color: rgba(255, 255, 255, 0.05);
    content: "";
    display: block;
    height: 2px;
    left: 0;
    position: absolute;
    top: 0;
    width: calc(100% - 24px);
  }
`


export const WalletNav: React.FunctionComponent<WalletNavProps> = (props: WalletNavProps): JSX.Element => {

  return <Container ctaLabel={props.ctaLabel} onClick={props.onClick} title={props.title} subtitle={props.subtitle} gradients={props.gradients} />
};

export default WalletNav;
