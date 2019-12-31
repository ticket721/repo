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
                title={text('Title', 'Click me !')}
                onClick={action('clicked')}
                type={select('Type', {
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
                    title={text('Title', 'Click me !')}
                    onClick={action('clicked')}
                    type={'primary'}
                >
                </Button>
            </div>
            <div style={{margin: 5}}>
                <Button
                    title={text('Title', 'Click me !')}
                    onClick={action('clicked')}
                    type={'warning'}
                >
                </Button>
            </div>
            <div style={{margin: 5}}>
                <Button
                    title={text('Title', 'Click me !')}
                    onClick={action('clicked')}
                    type={'error'}
                >
                </Button>
            </div>

        </div>
    </div>
);


