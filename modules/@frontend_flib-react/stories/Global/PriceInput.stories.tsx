import * as React from 'react';
import { boolean, color, text, withKnobs } from '@storybook/addon-knobs';
import PriceInput from '../../src/components/inputs/price';

export default {
    title: 'Global|Price input',
    decorators: [withKnobs],
    component: PriceInput,
};

export const Price = () => (
    <PriceInput
        error={text('Error message', 'Error')}
        label={text('Label', 'Price')}
        name={'price-input'}
        currName={'currency-input'}
        defaultCurrency={text('default curr', 'USD')}
        disabled={boolean('disabled', false)}
        currDisabled={boolean('disabled', false)}
        currColor={color('color', '#079CF0')}
        onPriceChange={(atomicValue) => console.log(atomicValue)}
        onCurrencyChange={(code) => console.log(code)}
        placeholder={text('Placeholder', '20')}
    />
);
