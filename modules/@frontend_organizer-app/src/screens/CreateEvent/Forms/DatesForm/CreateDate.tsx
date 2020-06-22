import React, { useState } from 'react';
import { Button } from '@frontend/flib-react/lib/components';

import { FormCard }     from '../FormCard';
import { DateItem }     from './index';
import { day, hour }    from '@frontend/core/lib/utils/date';
import { DateForm }     from './DateForm';

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
                        <DateForm
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
                    title={'Create New Date'}
                    variant={'secondary'}
                    onClick={() => setEdit(true)}/>
                    :
                    null
            }
        </>
    );
};
