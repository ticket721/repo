import * as React from 'react';
import { text, withKnobs } from '@storybook/addon-knobs';
import Tags from '../../src/components/tags';
import { Store, State } from '@sambego/storybook-state';

const maxItems: number = 2;

interface StoreObject {
    tags: string[];
    inputValue: string;
    error: string | undefined;
}

const onKeyDown = (e: React.KeyboardEvent<HTMLElement>, value: string) => {
    const tags = store.get('tags');
    store.set({ error: undefined });
    if (!store.get('inputValue')) {
        if (tags.length === maxItems) {
            e.preventDefault();
        }
        return;
    }

    switch (e.key) {
        case 'Enter':
        case 'Tab':
            if (tags.indexOf(value) > -1) {
                store.set({ error: 'tag already added' });
            } else {
                store.set({ inputValue: '' });
                store.set({ tags: [...tags, value] });
            }
            e.preventDefault();
    }
};

export default {
    component: Tags,
    decorators: [withKnobs],
    title: 'Desktop|Tags',
};

const storeObject: StoreObject = {
    tags: [],
    inputValue: '',
    error: undefined,
};

const store = new Store(storeObject);

export const showcase = () => (
    <State store={store}>
        {(state) => [
            <Tags
                label={text('Label', 'Tags')}
                placeholder={text('Placeholder', 'Add a tag, then press enter')}
                inputValue={state.inputValue}
                value={state.tags}
                currentTagsNumber={state.tags.length}
                maxTags={maxItems}
                onChange={(tags: string[]) => store.set({ tags })}
                onKeyDown={onKeyDown}
                onInputChange={(inputValue: string) => store.set({ inputValue })}
                name={'tagsName'}
                onBlur={() => {
                    console.log('onBlur');
                }}
                error={state.error}
            />,
        ]}
    </State>
);
