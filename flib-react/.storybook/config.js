import { DocsContainer, DocsPage } from '@storybook/addon-docs/dist/blocks';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { configure, addParameters } from '@storybook/react';
import { themes } from '@storybook/theming';

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
