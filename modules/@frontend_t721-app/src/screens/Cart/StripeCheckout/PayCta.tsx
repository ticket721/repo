import React, { useState }                from 'react';
import { useSelector }                    from 'react-redux';
import { T721AppState }                   from '../../../redux';
import { v4 }                             from 'uuid';
import { useTranslation }                 from 'react-i18next';
import { useRequest }                     from '@frontend/core/lib/hooks/useRequest';
import { DoubleButtonCta, FullButtonCta } from '@frontend/flib-react/lib/components';
import { ActionsSearchResponseDto }       from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { ActionSetEntity }                from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';

interface PayCtaProps {
    onClick: () => void;
    onSecondaryClick: () => void;
    show: boolean;
    cart: ActionSetEntity;
    submitted: boolean;
    disabled: boolean;
}

export const PayCta: React.FC<PayCtaProps> = (props: PayCtaProps): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const authorizationData = JSON.parse(props.cart.actions[2].data);
    const [clicked, setClicked] = useState(false);
    const [t] = useTranslation('cart');

    const checkoutAcset = useRequest<ActionsSearchResponseDto>({
        method: 'actions.search',
        args: [
            token,
            {
                id: {
                    $eq: authorizationData.checkoutActionSetId
                }
            }
        ],
        refreshRate: 3
    }, `PayCta@${uuid}`);

    let loading = checkoutAcset.response.loading;
    let label = 'cart_checkout_cta_pay';
    let variant = 'custom';

    if (!checkoutAcset.response.loading && (checkoutAcset.response.error || checkoutAcset.response.data.actionsets.length === 0)) {
        label = 'cart_checkout_cta_error';
        variant = 'disabled';
    }

    if (!loading) {
        if (props.submitted) {

            const checkout = checkoutAcset.response.data.actionsets[0];

            const resolveStep = JSON.parse(checkout.actions[0].data);
            const progressStep = JSON.parse(checkout.actions[1].data);

            if (resolveStep.status !== 'complete') {
                loading = true;
                label = 'cart_checkout_cta_waiting_response';
            } else if (progressStep.status !== 'complete') {
                loading = true;
                label = 'cart_checkout_cta_delivering_ticket'
            }
        } else if (props.disabled) {
            variant = 'disabled';
        }
    }

    const onClick = () => {
        setClicked(true);
        props.onClick();
    };

    if (!props.submitted) {
        return <DoubleButtonCta
            loading={loading || clicked}
            ctaLabel={t(label)}
            onClick={onClick}
            show={props.show}
            variant={variant}
            secondaryLabel={t('cart_checkout_cancel')}
            onSecondaryClick={props.onSecondaryClick}
        />
    } else {
        return <FullButtonCta
            loading={loading || clicked}
            ctaLabel={t(label)}
            onClick={onClick}
            show={props.show}
            variant={variant}
        />
    }

};

