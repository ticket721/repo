import { MetadataEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/metadatas/entities/Metadata.entity';
import { TitleText } from '@frontend/flib-react/lib/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './locales';
import { format } from '../../../../utils/date';

export interface ActivityCardProps {
    type: string;
    metadata: MetadataEntity;
    key: number;
}

export const UnknownActivity = (props: ActivityCardProps): JSX.Element => {
    const [t] = useTranslation('activity_cards');

    const formattedDate = format(new Date(props.metadata.date_.at));

    return (
        <>
            <TitleText small title={t('unknown')} text={formattedDate} key={props.key} />
        </>
    );
};

export const UserCreationActivity = (props: ActivityCardProps): JSX.Element => {
    const [t] = useTranslation('activity_cards');

    const formattedDate = format(new Date(props.metadata.date_.at));

    return (
        <>
            <TitleText small title={t('user_create')} text={formattedDate} key={props.key} icon={'profile'} />
        </>
    );
};

export const ActivityCard = (props: ActivityCardProps): JSX.Element => {
    switch (props.type) {
        case 't721_user_create':
        case 'web3_user_create':
            return <UserCreationActivity {...props} />;
        default:
            return <UnknownActivity {...props} />;
    }
};
