import * as React from 'react';
import { DocsContainer, DocsPage } from '@storybook/addon-docs/dist/blocks';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { configure, addParameters, addDecorator } from '@storybook/react';
import { withThemesProvider } from "themeprovider-storybook";
import { GlobalStyle } from '../src/shared/global';
import { themes } from '@storybook/theming';

const customThemes = [
  {
    name: 'T721',
    biggerSpacing: '24px',
    componentColor: 'rgba(255, 255, 255, 0.04)',
    componentColorLight: 'rgba(355, 255, 255, 0.06)',
    componentColorLighter: 'rgba(355, 255, 255, 0.1)',
    defaultRadius: '8px',
    doubleSpacing: '32px',
    primaryColor: '#079CF0',
    primaryColorGradientEnd: '#2143AB',
    regularSpacing: '16px',
    textColor: 'rgba(255, 255, 255, 0.9)',
    textColorDark: 'rgba(355, 255, 255, 0.6)',
    textColorDarker: 'rgba(355, 255, 255, 0.38)',
    warningColor: '#C91D31'
  }
]

addDecorator(withThemesProvider(customThemes));
addDecorator(style => <><GlobalStyle />{style()}</>);

addParameters({
  options: {
    theme: themes.dark,
    name: 'T721 React FLIB'
  },
  docs: {
    container: DocsContainer,
    page: DocsPage
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS
  }
});

// automatically import all files ending in *.stories.tsx
configure(require.context('../stories', true, /\.stories\.(ts|md)x$/), module);
