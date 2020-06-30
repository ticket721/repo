import React, { useState } from 'react';
import { Button } from '@frontend/flib-react/lib/components';

import { DateItem }     from './index';
import { day, hour }    from '@frontend/core/lib/utils/date';
import { UpdateDate }     from './UpdateDate';

import { useTranslation } from 'react-i18next';
import './locales';
import { FormCard }       from '../../../../components/FormCard';

interface CreateDateProps {
    editable: boolean;
    forcedEdit: boolean;
    onDateCreate: (date: DateItem) => void;
    initialName: string;
    initialLocation?: {
        label: string;
        lon: number;
        lat: number;
    };
}

export const CreateDate: React.FC<CreateDateProps> = (props: CreateDateProps) => {
    const [ t ] = useTranslation('create_date');
    const [ edit, setEdit ] = useState(null);

    return (
        <>
            {
                props.forcedEdit || edit ?
                    <FormCard
                    name={''}
                    edit={true}
                    editable={false}
                    setEdit={() => null}>
                        <UpdateDate
                        newItem={true}
                        initialValues={{
                            name: props.initialName,
                            eventBegin: new Date(Date.now() + hour),
                            eventEnd: new Date(Date.now() + day),
                            location: props.initialLocation ?
                                props.initialLocation :
                                {
                                    lon: null,
                                    lat: null,
                                    label: '',
                                }
                        }}
                        cancel={() => setEdit(false)}
                        confirm={(dateItem: DateItem) => {
                            props.onDateCreate(dateItem);
                            setEdit(false);
                        }}/>
                    </FormCard> :
                    null
            }
            {
                props.editable && !props.forcedEdit && !edit ?
                    <Button
                    title={t('create_date')}
                    variant={'secondary'}
                    onClick={() => setEdit(true)}/>
                    :
                    null
            }
        </>
    );
};
