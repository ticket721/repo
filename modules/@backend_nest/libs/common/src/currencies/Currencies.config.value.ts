import { CurrencyConfig } from '@lib/common/currencies/Currencies.service';

export default [
    {
        name: 'T721Token',
        type: 'erc20',
        loadType: 'module',
        dollarPeg: 1,
        moduleName: 't721token',
        contractName: 'T721Token',
        feeComputer: (amount: string) => {
            const price = BigInt(amount);
            return ((price / BigInt(100)) + BigInt(100)).toString();
        },
    },
    {
        name: 'Fiat',
        type: 'set',
        contains: ['T721Token'],
    },
] as CurrencyConfig[];
