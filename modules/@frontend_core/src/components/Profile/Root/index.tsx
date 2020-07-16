import React, { useState } from 'react';
import {
    LinksContainer,
    ArrowLink,
    WalletHeader,
    LanguageLink,
    FullPageLoading,
} from '@frontend/flib-react/lib/components';
import { useRequest } from '../../../hooks/useRequest';
import { MetadatasFetchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/metadatas/dto/MetadatasFetchResponse.dto';
import { v4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux';
import { ActivitiesList } from '../Activities/ActivitiesList';
import { Logout } from '../../../redux/ducks/auth';
import { useHistory } from 'react-router';
import { getContract } from '../../../subspace/getContract';
import { useTranslation } from 'react-i18next';
import '../locales';

// tslint:disable-next-line:no-var-requires
const { observe, useSubspace } = require('@embarklabs/subspace-react');

const ConnectedWalletHeader = observe(WalletHeader);

export interface ProfileRootProps {
    desktop?: boolean;
    extraButtons?: JSX.Element[];
}

const ProfileRoot: React.FC<ProfileRootProps> = ({ desktop, extraButtons }: ProfileRootProps): JSX.Element => {
    const [uuid] = useState(v4());
    const { token, userUuid, username, address } = useSelector((state: AppState) => ({
        token: state.auth.token?.value,
        userUuid: state.auth.user?.uuid,
        username: state.auth.user?.username,
        address: state.auth.user?.address,
    }));
    const dispatch = useDispatch();
    const history = useHistory();
    const subspace = useSubspace();
    const T721TokenContract = getContract(subspace, 't721token', 'T721Token', uuid);
    const [t, i18n] = useTranslation('profile');

    const { response: activityResponse } = useRequest<MetadatasFetchResponseDto>(
        {
            method: 'metadatas.fetch',
            args: [
                token,
                {
                    useReadRights: [
                        {
                            id: userUuid,
                            type: 'user',
                            field: 'id',
                        },
                    ],
                    withLinks: [
                        {
                            id: userUuid,
                            type: 'user',
                            field: 'id',
                        },
                    ],
                    metadataClassName: 'history',
                },
            ],
            refreshRate: 50,
        },
        uuid,
    );

    if (T721TokenContract.loading) {
        return <FullPageLoading />;
    }

    if (T721TokenContract.error) {
        return <p>Unable to recover contracts</p>;
    }

    const $balance = T721TokenContract.contract.methods.balanceOf(address).track();

    return (
        <>
            <ConnectedWalletHeader username={username} picture={'/favicon.ico'} balance={$balance} />
            <ActivitiesList
                loading={activityResponse.loading}
                error={activityResponse.error}
                data={activityResponse.data}
                limit={3}
                link={desktop ? history.location.pathname + '?profile=activities' : 'profile/activities'}
            />
            <LinksContainer title={t('account')}>
                {extraButtons || null}
                <LanguageLink
                    label={t('language')}
                    currentLanguage={t(i18n.language.slice(0, 2))}
                    onClick={() => {
                        history.push(desktop ? history.location.pathname + '?profile=language' : 'profile/language');
                    }}
                />
                <ArrowLink
                    label={t('log_out')}
                    onClick={() => {
                        dispatch(Logout());
                        history.replace('/');
                    }}
                />
            </LinksContainer>
        </>
    );
};

export default ProfileRoot;
