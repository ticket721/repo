# flib-react (react + typescript frontend libraries)

The goal of this repository is to develop a react design system similar to what [this repository has done](https://github.com/storybookjs/design-system).

## Status

| Name | Status |
| :---: | :---: |
| Coveralls | [![Coverage Status](https://coveralls.io/repos/github/ticket721/flib-react/badge.svg?branch=master)](https://coveralls.io/github/ticket721/flib-react?branch=master) |

## Developing

The goal of this setup is to have completely isolated components for the T721 platform. Each component is developed inside its own directory, and has an associated `stories.tsx` file and tests.

### Components

The rules for the components are simple:

- All components should be FunctionComponents: they should not have state
- All components should have a `ComponentNameProps` interface exported
- All files should have a default + named export of the components


Below is an example for a `Button` component (`src/button/index.tsx`)
```typescript jsx
import * as React from 'react';

export interface ButtonProps extends React.ComponentProps<any> {
    /**
     * Title of the button
     */
    title: string;

    /**
     * Method called upon button click
     */
    onClick?: () => void;

    /**
     * Style type of the button
     */
    variant: 'primary' | 'warning' | 'error';
}

const colors = {
    'primary': '#188ae2',
    'error': 'red',
    'warning': 'orange'
};

/**
 * This is a Button component
 */
export const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps): JSX.Element => {

    return <button
        name={props.title}
        onClick={props.onClick}
        style={{
            padding: 10,
            borderRadius: 7,
            backgroundColor: colors[props.variant],
            borderColor: colors[props.variant],
            cursor: 'pointer'
        }}
    >
        {props.title}
    </button>
};

Button.defaultProps = {
    variant: 'primary',
    onClick: () => {},
};

export default Button;
```

For the first rule, this means that any sort of variable needed inside the component should be received by props. `state` cannot be used. If you need some sort of stateful behavior (forms), you will have to delegate everything to the calling Component.

Let's say we have an `Input` component, it should receive the displayed value in the props (`props.value`), and should accept a setter too (`props.setValue`). The state is now handled outside.

A global styling system should be used in order to minimize the amount of CSS written in every component, and make the components' styles easier to edit.

### Stories

Stories come from [Storybook](https://www.learnstorybook.com/intro-to-storybook/). They are pieces of code used to showcase the component. The goal behind them is to create a complete & interactive documentation for the library.
Things to know about stories:

- `knobs` are very powerful add-ons that will make the component props editable from the Storybook UI. Let's say we have a `Button` with 2 props: `title` & `variant`. If we use `knobs` on both props, the Storybook UI will show two sections on the knob page where we will be able to manually edit the `title` & `variant` props of the currently rendered component. [Usage info here](https://www.npmjs.com/package/@storybook/addon-knobs).

- `actions` are add-ons that will log information upon a specific action triggered by the component. Let's say our `Button` component has a `onClick` prop. Giving an action to this prop will make the component interactive in the Storybook UI, and everytime you click the component, it will be logged. [Usage info here](https://www.npmjs.com/package/@storybook/addon-actions)

- `docs` are very important. By default, all JSDoc comments are parsed and displayed inside the `Docs` page of the Storybook UI. There is a bug with the add-on. If we want props to be properly displayed and documented, we need to use the named export and not the default export. [Usage info here](https://www.npmjs.com/package/@storybook/addon-docs)

Below is an example of stories file (`stories/Button.stories.tsx`)
```typescript jsx
import * as React                  from 'react';
import { action }                  from '@storybook/addon-actions';
import { select, text, withKnobs } from '@storybook/addon-knobs';
import { Button }                  from '../src/button';

export default {
    title: 'Button',
    decorators: [
        withKnobs
    ],
    component: Button
};

export const showcase = () => (
    <div style={{
        width: '100%',
        height: '100%'
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Button
                title={text('Title', 'Button Title')}
                onClick={action('clicked')}
                variant={select('Variant', {
                    Primary: 'primary',
                    Warning: 'warning',
                    Error: 'error'
                }, 'primary')
                }
            >
            </Button>

        </div>
    </div>
);

export const types = () => (
    <div style={{
        width: '100%',
        height: '100%'
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{margin: 5}}>
                <Button
                    title={text('Title', 'Button Title')}
                    onClick={action('clicked')}
                    variant={'primary'}
                >
                </Button>
            </div>
            <div style={{margin: 5}}>
                <Button
                    title={text('Title', 'Button Title')}
                    onClick={action('clicked')}
                    variant={'warning'}
                >
                </Button>
            </div>
            <div style={{margin: 5}}>
                <Button
                    title={text('Title', 'Button Title')}
                    onClick={action('clicked')}
                    variant={'error'}
                >
                </Button>
            </div>

        </div>
    </div>
);
```

### Tests

#### Rendering Snapshot Testing

Snapshot testing is very useful to prevent hidden rendering errors from being pushed. When running the test for the first time a snapshot of the component will be created. Once the component is done, we can push it with its snapshots.

Simply running `npm run test` will do everything. If you have conflicts with the snapshot (the snapshot was created earlier and you made some changes to the component), you can update the snapshot by running `npm run test:update-snapshots`

[Usage tutorial here](https://scotch.io/tutorials/writing-snapshot-tests-for-react-components-with-jest)

```typescript jsx
it('Button renders correctly', function () {

    const props: ButtonProps = {
        onClick: () => {
        },
        variant: 'primary',
        title: 'test'
    };

    const tree = renderer
        .create(<Button {...props} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});
```

#### Functional Dom Testing

In order to test the component behavior, we also need DOM testing. By using `enzyme` we can very easily render and test components. [Usage info here](https://airbnb.io/enzyme/)

```typescript jsx
it("Button click works", () => {

    let value = false;

    const props: ButtonProps = {
        onClick: () => {
            value = true;
        },
        variant: 'primary',
        title: 'test'
    };
    const button = shallow(<Button {...props}/>);

    button.simulate('click');

    expect(value).toBeTruthy();

});
```

#### Test coverage

A minimum of 95% of coverage is expected. This is not a random value, it is the threshold from which we can safely apply dependencies upgrades by knowing that the test would have failed if the update modifies the resulting components. It might take some time to write, but wins an insane amount of time in the long run.
