import * as React from 'react';
import styled from '../../../config/styled';

const BorderContainer = styled.div`
  background-color: #120F1A;
  content: "";
  display: block;
  height: 2px;
  width: 100%;
`

export const Border: React.FunctionComponent = (): JSX.Element => {

  return <BorderContainer />

};

export default Border;
