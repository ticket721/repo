import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import styled             from 'styled-components';

export interface TicketInfo {
    categoryId: string;
    category: CategoryEntity;
    price: string;
    fees: string;
}

export interface CategoriesById {
    [key: string]: TicketInfo[];
}

export interface CategoriesByDate {
    [key: string]: CategoriesById;
}

export interface ConvertedCart {
    global: CategoriesByDate;
    date: CategoriesByDate;
}

export const CartReviewOrderEventTitle = styled.h3`
  margin-top: ${props => props.theme.doubleSpacing};
  text-transform: uppercase;
  opacity: 0.4;
`;

export const Header = styled.header`
    margin: 0 24px;
    position: relative;
    z-index: 1;
`;

export const completeCartRecomputer = (cart: ConvertedCart): CategoryEntity[] => {
    let ret: CategoryEntity[] = [];

    for (const date of Object.keys(cart.date)) {
        for (const category of Object.keys(cart.date[date])) {
            ret = [
                ...ret,
                ...cart.date[date][category].map(ti => ti.category)
            ]
        }
    }

    for (const global of Object.keys(cart.global)) {
        for (const category of Object.keys(cart.global[global])) {
            ret = [
                ...ret,
                ...cart.global[global][category].map(ti => ti.category)
            ]
        }
    }

    return ret;
}

export const Container = styled.section`
  margin-bottom: calc(${props => props.theme.doubleSpacing} * 2);
`;

export const BorderGradient = styled.div<any>`
  height: ${props => props.theme.smallSpacing};
    background: linear-gradient(90deg, ${props => props.gradient.join(', ')});

    &::after {
        z-index: -1;
        background: linear-gradient(90deg, ${(props) => props.gradient.join(', ')});
        content: '';
        display: block;
        filter: blur(10px);
        width: 100%;
        opacity: 0.12;
        height: 20px;
    }
`;

export const completeCartRecomputingOnDateTicketChange =
    (cart: ConvertedCart, dateId: string, categoryId: string, count: number): CategoryEntity[] => {
        cart.date[dateId][categoryId] = [...new Array(count)].map(i => cart.date[dateId][categoryId][0]);

        return completeCartRecomputer(cart);
    };

export interface Item {
    name: string;
    price: number;
}

export const getCartTotal = (cart: CategoryEntity[], prices: string[]): Item[] => {

    const ret: Item[] = [];

    for (let idx = 0; idx < cart.length; ++idx) {
        ret.push({
            name: `Ticket "${cart[idx].display_name}"`,
            price: parseInt(prices[idx], 10) / 100,
        });
    }

    return ret;
};

const reverseTotalAmountWithEuropeanFees = (total: number): number => {
    return ((total + 0.25) / 0.986) - total;
}

export const getServiceFees = (title: string, fees: string[], prices: Item[]): Item[] => {

    const totalFees = fees.map(f => parseInt(f, 10) / 100).reduce((a, b) => a + b);
    const totalSum = prices.map(i => i.price).reduce((a, b) => a + b);

    return [{
        name: title,
        price: totalFees + // T721 fees
            reverseTotalAmountWithEuropeanFees(totalSum + totalFees), // Stripe fees
    }];
};


