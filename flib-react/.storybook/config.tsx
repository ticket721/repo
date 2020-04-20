import { DocsContainer, DocsPage }                from '@storybook/addon-docs/dist/blocks';
import { INITIAL_VIEWPORTS }                      from '@storybook/addon-viewport';
import { configure, addParameters, addDecorator } from '@storybook/react';
import { withThemesProvider }                     from 'themeprovider-storybook';
import { GlobalStyles } from '../src/shared';
import { customThemes } from '../src/config/theme';
import { themes }       from '@storybook/theming';
import * as React                                 from 'react';
import { StoryFn }                                from '@storybook/addons';

addDecorator(withThemesProvider([customThemes['t721']]));

function withGlobalStyles(storyFn: StoryFn) {
  return (
    <>
        <GlobalStyles />
        {storyFn()}
    </>
  )
}

addDecorator(withGlobalStyles);

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
