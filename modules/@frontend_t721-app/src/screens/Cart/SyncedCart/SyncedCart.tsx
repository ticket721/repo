import React                                      from 'react';
import { CartState }                              from '../../../redux/ducks/cart';
import { ActionSetEntity }                        from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { CategoryEntity }                         from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { Button, FullPageLoading, PurchaseTotal } from '@frontend/flib-react/lib/components';
import styled                                     from 'styled-components';
import { useTranslation }                         from 'react-i18next';
import { SyncedCartGlobalSection }                from './SyncedCartGlobalSection';
import { ConvertedCart }                          from './types';
import { SyncedCartDateSection }                  from './SyncedCartDateSection';

export interface SyncedCartProps {
    cart: CartState;
    remoteCart: ActionSetEntity;
}

const CartReviewOrderTitle = styled.h1`
  margin-top: ${props => props.theme.regularSpacing};
  margin-left: ${props => props.theme.regularSpacing};
`;

interface RemoteTicketInfo {
    categoryId: string;
}

const convertCart = (tickets: RemoteTicketInfo[], categoriesEntities: CategoryEntity[], prices: string[], fees: string[]): ConvertedCart => {

    const convertedCarts: ConvertedCart = {
        date: {},
        global: {},
    };

    for (let idx = 0; idx < tickets.length; ++idx) {
        const entityIdx = categoriesEntities.findIndex((c: CategoryEntity): boolean => c.id === tickets[idx].categoryId);

        if (entityIdx === -1) {
            continue;
        }

        const entity = categoriesEntities[entityIdx];

        if (entity.parent_type === 'date') {
            convertedCarts.date = {
                ...convertedCarts.date,
                [entity.parent_id]: {
                    ...(convertedCarts.date[entity.parent_id] || {}),
                    [entity.id]: [
                        ...(convertedCarts.date[entity.parent_id]?.[entity.id] || []),
                        {
                            categoryId: entity.id,
                            category: entity,
                            fees: (parseInt(fees[idx], 10) / 100).toString(),
                            price: (parseInt(prices[idx], 10) / 100).toString(),
                        },
                    ],
                },
            };
        } else {
            convertedCarts.global = {
                ...convertedCarts.global,
                [entity.group_id]: {
                    ...(convertedCarts.global[entity.group_id] || {}),
                    [entity.id]: [
                        ...(convertedCarts.global[entity.group_id]?.[entity.id] || []),
                        {
                            categoryId: entity.id,
                            category: entity,
                            fees: (parseInt(fees[idx], 10) / 100).toString(),
                            price: (parseInt(prices[idx], 10) / 100).toString(),
                        },
                    ],
                },
            };
        }
    }

    return convertedCarts;

};

interface Item {
    name: string;
    price: number;
}

const getCartTotal = (cart: CategoryEntity[], prices: string[]): Item[] => {

    const ret: Item[] = [];

    for (let idx = 0; idx < cart.length; ++idx) {
        ret.push({
            name: `Ticket "${cart[idx].display_name}"`,
            price: parseInt(prices[idx], 10) / 100,
        });
    }

    return ret;
};

const getServiceFees = (title: string, fees: string[]): Item[] => {

    const totalFees = fees.map(f => parseInt(f, 10) / 100).reduce((a, b) => a + b);

    return [{
        name: title,
        price: totalFees,
    }];
};

const getStripeFDPFees = (title: string, items: Item[]): Item[] => {

    const totalSum = items.map(i => i.price).reduce((a, b) => a + b);

    return [{
        name: title,
        price: totalSum * 0.014 + 0.25,
    }];

};

const PurchaseButtonWrapper = styled.div`
  padding: ${props => props.theme.regularSpacing};
`;

export const SyncedCart: React.FC<SyncedCartProps> = (props: SyncedCartProps): JSX.Element => {
    const [t] = useTranslation('cart');

    if (props.remoteCart.actions[0].status !== 'complete') {
        return <FullPageLoading/>;
    }

    const parsedActionData = JSON.parse(props.remoteCart.actions[0].data);

    const tickets: RemoteTicketInfo[] = parsedActionData.tickets;
    const fees: string[] = parsedActionData.fees;
    const total: string[] = parsedActionData.total.map(i => i.value);

    const convertedCart = convertCart(tickets, props.cart.tickets, total, fees);

    let idx = 1;

    const totalItems = getCartTotal(props.cart.tickets, total);
    const serviceFeeItems = getServiceFees(t('synced_cart_processing_fees'), fees);
    const paymentFeeItems = getStripeFDPFees(t('synced_cart_payment_fees'), [
        ...totalItems,
        ...serviceFeeItems,
    ]);

    return <>
        <CartReviewOrderTitle>{t('synced_cart_review_title')}</CartReviewOrderTitle>
        {
            Object
                .keys(convertedCart.date)
                .map((dateId: string) => {
                    ++idx;
                    return <SyncedCartDateSection idx={idx - 1} convertedCart={convertedCart} date={dateId} key={dateId}/>;
                })
        }
        {
            Object
                .keys(convertedCart.global)
                .map((groupId: string) => {
                    ++idx;
                    return <SyncedCartGlobalSection idx={idx - 1} convertedCart={convertedCart} group={groupId} key={groupId}/>;
                })
        }
        <PurchaseTotal
            totalLabel={t('synced_cart_total')}
            subtotalLabel={t('synced_cart_subtotal')}
            label={t('synced_cart_total_title')}
            total={totalItems}
            fees={[
                ...serviceFeeItems,
                ...paymentFeeItems,
            ]}
        />
        <PurchaseButtonWrapper>
            <Button
                title={t('synced_cart_payment_button')}
                variant={'primary'}
            />
        </PurchaseButtonWrapper>
    </>;
};
