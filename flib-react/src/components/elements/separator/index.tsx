import * as React from 'react';
import styled from '../../../config/styled';

const SeparatorContainer = styled.div`
  background-color: #0B0912;
  bottom: 0;
  content: "";
  display: block;
  height: 2px;
  left: 0;
  position: absolute;
  width: calc(100% + 8px);
  z-index: 100;

  &::before {
    background-color: #0B0912;
    content: "";
    display: inline-block;
    height: ${props => props.theme.regularSpacing};
    position: absolute;
    top: -7px;
    transform: rotate(45deg);
    width: ${props => props.theme.regularSpacing};
  }

  &::before {
    left: -8px;
  }

`

export const Separator: React.FunctionComponent = (): JSX.Element => {

  return <SeparatorContainer />

};

export default Separator;
