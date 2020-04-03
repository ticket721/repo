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
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 1;
  position: relative;
`;

export const labelStyles = css`
  color: rgba( 255, 255, 255, 0.6);
  font-size: 11px;
  font-weight: 700;
  padding: 0 1.5rem;
  text-transform: uppercase;
`

export const buttonStyles = css`
  appearance: none;
  cursor: pointer;
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
`;

export const inputStyles = css`
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 1rem 1.5rem;

  &:focus {
    outline: none;
  }

  &::placeholder,
  &::-webkit-input-placeholder {
    color: rgba(255, 255, 255, 0.38);
  }
`;

export const checkboxStyles = css`
  opacity: 0;
  position: absolute;
  visibility: hidden;
  z-index: -99999;
`;

export const listStyles = css`
  list-style: none;
`

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

  label {
    ${labelStyles}
  }

  ul {
    ${listStyles}
  }

  input,
  textarea,
  select {
    ${inputStyles}
  }

  textarea {
    min-height: 150px;
  }

  input[type='checkbox'],
  input[type='radio'] {
    ${checkboxStyles}
  }

  .row {
    display: flex;
  }

  .aic {
    align-items: center;
  }

  .jcsb {
    justify-content: space-between;
  }

  .container {
    margin: 1.5rem auto;
    max-width: 600px;
    width: 100%;
  }
`;
