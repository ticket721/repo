import { createGlobalStyle, css } from 'styled-components';

export const masterReset = css`
  box-sizing: inherit;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  border-radius: 0;
  -webkit-margin-before: 0;
  -webkit-margin-after: 0;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
  -webkit-padding-before: 0;
  -webkit-padding-start: 0;
  -webkit-padding-end: 0;
  -webkit-padding-after: 0;
`;

export const bodyStyles = css`
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  background: linear-gradient(91.44deg, #0A0812 0.31%, #120F1A 99.41%);
  box-sizing: border-box;
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
  font-size: 16px;
  position: relative;
  line-height: 1;
`;

export const buttonStyles = css`
  appearance: none;
  cursor: pointer;
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
`;

export const GlobalStyle = createGlobalStyle`
  * {
    ${masterReset}
  }
  html {
    box-sizing: border-box;
  }
  body {
    ${bodyStyles}
  }
  button {
    ${buttonStyles}
  }
`;
