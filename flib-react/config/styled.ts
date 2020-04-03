import * as baseStyled from "styled-components";
import { Theme } from "./theme"; //Import our interface

const { default: styledTyped /* Rename default export of baseStyled */, ThemeProvider, keyframes } = baseStyled as baseStyled.ThemedStyledComponentsModule<Theme>;

// And cast it to ThemedStyledComponentsModule<Theme> with previously specified Theme type
export { ThemeProvider, keyframes };
export default styledTyped;
