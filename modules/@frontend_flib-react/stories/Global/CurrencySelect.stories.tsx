import * as React from 'react';
import { color, withKnobs } from '@storybook/addon-knobs';
import CurrencySelectInput from '../../src/components/inputs/currency-select';

export default {
    title: 'Global|Currency Select input',
    decorators: [withKnobs],
    component: CurrencySelectInput,
};

export const showcase = () => (
    <div style={{ width: 90 }}>
        <CurrencySelectInput
            name={'currency-sel'}
            selectedColor={color('selected color', '#079CF0')}
            onChange={(opt) => console.log('changed to', opt)}
        />
    </div>
);
