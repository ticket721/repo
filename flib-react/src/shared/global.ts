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
`;

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
`;

export const linkStyle = css`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
`;

export const GlobalStyles = createGlobalStyle`
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

  div {
    display: block;
  }

  label {
    ${labelStyles}
  }

  ul {
    ${listStyles}
  }

  a {
    ${linkStyle}
  }

  p {
    line-height: 150%;
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
    width: 100%;
  }

  .aic {
    align-items: center;
  }

  .aife {
    align-items: flex-end;
  }

  .jcc{
    justify-content: center;
  }

  .jcsb {
    justify-content: space-between;
  }

  .column {
    display: flex;
    flex-direction: column;
  }

  .clear--nav {
    margin-top: 1.5rem;
  }

  .container {
    margin: 1.5rem 1rem;
    max-width: 600px;
  }

  .margin--lr {
    margin: 0 1.5rem;
  }

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
  }

  h3 {
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
  }

  h4 {
    font-size: 14px;
    font-weight: 500;
    line-height: 150%;

    &.uppercase {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  }

  .utils {
    &--mb {
      margin-bottom: 1rem;
    }
  }

`;

