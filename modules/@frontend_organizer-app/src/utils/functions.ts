import { Price }          from '@common/sdk/lib/@backend_nest/libs/common/src/currencies/Currencies.service';
import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';


export const formatDateForDisplay = (dateToFormat: Date | string, format: 'all' | 'day' | 'time' = 'all'): string => {
  const getMinutes = (d: Date): string => (d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`);

  let date: Date;

  if (typeof dateToFormat === typeof 'string') {
    date = new Date(dateToFormat)
  } else {
    // @ts-ignore
    date = dateToFormat;
  }
  if (format === 'all') {
    return `${date.toDateString()} - ${date.getHours()}:${getMinutes(date)}`;

  } else if (format === 'day') {
    return date.toDateString();

  } else {
    return `${date.getHours()}:${getMinutes(date)}`;
  }
};

export const getT721TokenPrice = (prices: Price[]): number => {
  if (prices.findIndex((price: Price): boolean => price.currency === 'T721Token') !== -1) {
    return parseInt(prices[prices.findIndex((price: Price): boolean => price.currency === 'T721Token')].value, 10) / 100;
  } else if (prices.length === 0) {
    return 0;
  } else {
    return null;
  }
};

export const getPriceRange = (categories: CategoryEntity[]): [number, number] => {

  if (categories.length === 0) {
    return [null, null]
  }

  const prices = categories
    .map((category: CategoryEntity): number => getT721TokenPrice(category.prices))
    .filter((price: number): boolean => price !== null);

  const sortedPrices = prices.filter((price: number, idx: number): boolean => prices.indexOf(price) === idx)
    .sort((lprice: number, rprice: number) => lprice - rprice);

  if (sortedPrices.length === 1) {
    return [sortedPrices[0], null]
  } else if (sortedPrices.length) {
    return [sortedPrices[0], sortedPrices[sortedPrices.length - 1]];
  } else {
    return [null, null];
  }

};
