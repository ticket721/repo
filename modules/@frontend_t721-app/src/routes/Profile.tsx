import { StatusBarMargin } from '@frontend/core/lib/utils/StatusBarMargin';
import { NavbarMargin }             from '@frontend/core/lib/utils/NavbarMargin';
import ProfileRoot                  from '@frontend/core/lib/components/Profile/Root';
import React, { useState }          from 'react';
import { useSelector }              from 'react-redux';
import { T721AppState }             from '../redux';
import { v4 }                       from 'uuid';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { ActionsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { ArrowLink }                from '@frontend/flib-react/lib/components';
import { useHistory }               from 'react-router';
import { useTranslation }           from 'react-i18next';
import { DesktopWarning }           from '../utils/DesktopWarning';


const T721Profile: React.FC = (): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const history = useHistory();
    const [t] = useTranslation('router');

    const cartResponse = useRequest<ActionsSearchResponseDto>({
        method: 'actions.search',
        args: [
            token,
            {
                consumed: {
                    $eq: false,
                },
                name: {
                    $eq: '@cart/creation',
                },
            },
        ],
        refreshRate: 3,
    }, `LoginNavbar@${uuid}`);

    const extraButtons = [];

    if (!cartResponse.response.loading && !cartResponse.response.error && cartResponse.response.data.actionsets.length > 0) {

        const ticketSelectionData = JSON.parse(cartResponse.response.data.actionsets[0].actions[0].data);

        const badged = ticketSelectionData.tickets?.length > 0;

        extraButtons.push(
            <ArrowLink
                key={'cart'}
                badged={badged}
                label={t('cart')}
                onClick={() => {
                    history.push('/cart/checkout');
                }}
            />
        )
    }

    return <ProfileRoot
        extraButtons={extraButtons}
    />

};

export default DesktopWarning(StatusBarMargin(NavbarMargin(T721Profile)));

