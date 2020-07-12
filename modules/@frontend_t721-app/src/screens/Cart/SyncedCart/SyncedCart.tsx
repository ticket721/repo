import React, { useEffect, useState } from 'react';
import { CartState }                  from '../../../redux/ducks/cart';
import { ActionSetEntity }                             from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { CategoryEntity }                              from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { Button, FullPageLoading, PurchaseTotal }      from '@frontend/flib-react/lib/components';
import styled                                          from 'styled-components';
import { useTranslation }                              from 'react-i18next';
import { SyncedCartGlobalSection }                     from './SyncedCartGlobalSection';
import { ConvertedCart, getCartTotal, getServiceFees } from './types';
import { SyncedCartDateSection }                       from './SyncedCartDateSection';
import { useLazyRequest, RequestBag }                  from '@frontend/core/lib/hooks/useLazyRequest';
import { CheckoutCartCommitStripeResponseDto }         from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/checkout/dto/CheckoutCartCommitStripeResponse.dto';
import { v4 }                                          from 'uuid';
import { useSelector }                                 from 'react-redux';
import { T721AppState }                                from '../../../redux';
import { ActionsUpdateResponseDto }                    from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { useDeepEffect }                               from '@frontend/core/lib/hooks/useDeepEffect';
import { ActionsSearchResponseDto }                    from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsSearchResponse.dto';

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

const PurchaseButtonWrapper = styled.div`
  padding: ${props => props.theme.regularSpacing};
`;

const configurationStep = (
    modulesConfigurationCall: RequestBag<ActionsUpdateResponseDto>,
    token: string,
    remoteCart: ActionSetEntity,
    setLastUpdated: (now: Date) => void,
    setStatus: (status: string) => void,
) => {

    const lastUpdate = new Date(Date.now());

    modulesConfigurationCall.lazyRequest([
        token,
        remoteCart.id,
        {},
    ], {
        force: true,
    });

    setLastUpdated(lastUpdate);

    setStatus('modules_configuration_upload');
};

const commitStripeCheck = (
    commitStripeCall: RequestBag<CheckoutCartCommitStripeResponseDto>,
    token: string,
    remoteCart: ActionSetEntity,
    setStatus: (status: string) => void
) => {

    if (remoteCart.actions[0].status === 'complete' && remoteCart.actions[1].status === 'complete') {

        if (!commitStripeCall.response.called) {

            commitStripeCall.lazyRequest([
                token,
                {
                    cart: remoteCart.id,
                },
            ], {
                force: true,
            });

            setStatus('commit_stripe_called');

        }

    }

};

const forcedActionSetUpdate = (
    ticketsSelectionCall: RequestBag<ActionsUpdateResponseDto>,
    actionsetSearchCall: RequestBag<ActionsSearchResponseDto>,
    setLastUpdated: (now: Date) => void,
    lastUpdate: Date,
    remoteCart: ActionSetEntity,
    token: string,
    setStatus: (status: string) => void,
) => {

    if (!ticketsSelectionCall.response.called) {

        const ticketsSelectionData = JSON.parse(remoteCart.actions[0].data);

        const newLastUpdated = new Date(Date.now());

        ticketsSelectionCall.lazyRequest([token, remoteCart.id, {
            tickets: ticketsSelectionData.tickets,
        }], {
            force: true,
        });

        setLastUpdated(newLastUpdated);

        setStatus('ticket_selection_waiting_refresh');

    } else if (!actionsetSearchCall.response.called) {

        actionsetSearchCall.lazyRequest([
            token,
            {
                consumed: {
                    $eq: false,
                },
                name: {
                    $eq: '@cart/creation',
                },
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'asc',
                }],
            },
        ]);

    }

};

const isForceUpdated = (remoteCart: ActionSetEntity, lastUpdate: Date) => {
    return (lastUpdate !== null && new Date(remoteCart.updated_at).getTime() >= lastUpdate.getTime());
};

const whilePayment = (
    ticketsSelectionCall: RequestBag<ActionsUpdateResponseDto>,
    modulesConfigurationCall: RequestBag<ActionsUpdateResponseDto>,
    commitStripeCall: RequestBag<CheckoutCartCommitStripeResponseDto>,
    actionsetSearchCall: RequestBag<ActionsSearchResponseDto>,
    lastUpdate: Date,
    setLastUpdated: (now: Date) => void,
    token: string,
    remoteCart: ActionSetEntity,
    setStatus: (status: string) => void,
) => {

    if (!isForceUpdated(remoteCart, lastUpdate)) {

        forcedActionSetUpdate(ticketsSelectionCall, actionsetSearchCall, setLastUpdated, lastUpdate, remoteCart, token, setStatus);

    } else {

        if (!modulesConfigurationCall.response.called) {
            configurationStep(modulesConfigurationCall, token, remoteCart, setLastUpdated, setStatus);
        } else {
            commitStripeCheck(commitStripeCall, token, remoteCart, setStatus);
        }

    }

};

export const SyncedCart: React.FC<SyncedCartProps> = (props: SyncedCartProps): JSX.Element => {
    const [t] = useTranslation('cart');

    const [payment, paymentCalled] = useState(false);
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [lastUpdate, setLastUpdated] = useState(null);
    const [uuid] = useState(v4());
    const [status, setStatus] = useState('ticket_selection_waiting_refresh');

    const ticketsSelectionCall = useLazyRequest<ActionsUpdateResponseDto>('cart.ticketSelections', `SyncedCart@${uuid}`);
    const actionSetSearchCall = useLazyRequest<ActionsSearchResponseDto>('actions.search', `SyncedCart@${uuid}`);
    const modulesConfigurationCall = useLazyRequest<ActionsUpdateResponseDto>('cart.modulesConfiguration', `SyncedCart@${uuid}`);
    const commitStripeCall = useLazyRequest<CheckoutCartCommitStripeResponseDto>('checkout.cart.commit.stripe', `SyncedCart@${uuid}`);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useDeepEffect(() => {

        if (payment) {
            whilePayment(
                ticketsSelectionCall,
                modulesConfigurationCall,
                commitStripeCall,
                actionSetSearchCall,

                lastUpdate,
                setLastUpdated,
                token,
                props.remoteCart,
                setStatus,
            );
        }

    }, [
        payment,
        props.remoteCart,
        lastUpdate,
        commitStripeCall.response,
        modulesConfigurationCall.response,
        ticketsSelectionCall.response,
        actionSetSearchCall.response,
    ]);

    const parsedActionData = JSON.parse(props.remoteCart.actions[0].data);

    if (!parsedActionData.fees || !parsedActionData.total) {
        return <FullPageLoading/>;
    }

    const tickets: RemoteTicketInfo[] = parsedActionData.tickets;
    const fees: string[] = parsedActionData.fees;
    const total: string[] = parsedActionData.total.map(i => i.value);

    const convertedCart = convertCart(tickets, props.cart.tickets, total, fees);

    let idx = 1;

    const totalItems = getCartTotal(props.cart.tickets, total);
    const serviceFeeItems = getServiceFees(t('synced_cart_processing_fees'), fees, totalItems);

    const onPayment = (): void => {
        paymentCalled(true);
    };

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
            ]}
        />
        <PurchaseButtonWrapper>
            <Button
                onClick={onPayment}
                loadingState={payment}
                title={t(payment ? status : 'synced_cart_payment_button')}
                variant={payment ? 'secondary' : 'primary'}
            />
        </PurchaseButtonWrapper>
    </>;
};
