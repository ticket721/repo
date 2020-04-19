import * as baseStyled from 'styled-components';
import { Theme } from './theme';

const { default: styledTyped, ThemeProvider, keyframes } = baseStyled as baseStyled.ThemedStyledComponentsModule<Theme>;

// And cast it to ThemedStyledComponentsModule<Theme> with previously specified Theme type
export { ThemeProvider, keyframes };
export default styledTyped;
