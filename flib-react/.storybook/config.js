import { DocsContainer, DocsPage } from '@storybook/addon-docs/dist/blocks';
import { configure, addParameters } from '@storybook/react';
import { themes } from '@storybook/theming';

addParameters({
    options: {
        theme: themes.dark
    },
    docs: {
        container: DocsContainer,
        page: DocsPage
    }
});

// automatically import all files ending in *.stories.tsx
configure(require.context('../stories', true, /\.stories\.(ts|md)x$/), module);
