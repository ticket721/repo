import React, { useEffect, useState } from 'react';
import { Button, SelectInput } from '@frontend/flib-react/lib/components';

import { CategoryItem }                 from '../index';
import { CategoryForm }                 from '../CategoryForm';
import { checkFormatDate, displayDate } from '@frontend/core/lib/utils/date';
import { DateItem }                     from '../../DatesForm';
import { FormCard }                              from '../../FormCard';

interface CreateSpecificCategoryProps {
    dates: DateItem[];
    editable: boolean;
    onCategoryCreate: (dates: number[], category: CategoryItem) => void;
}

export const CreateSpecificCategory: React.FC<CreateSpecificCategoryProps> = (props: CreateSpecificCategoryProps) => {
    const [ selectableDates, setSelectableDates ] = useState([]);
    const [ edit, setEdit ] = useState(null);
    const [ selectedDates, setSelectedDates ] = useState([]);

    useEffect(() =>
        setSelectableDates([
            ...props.dates.map((date: DateItem, idx: number) => ({
                label: `${date.name} - ${displayDate(checkFormatDate(date.eventBegin))}`,
                value: idx,
            })),
            {
                label: 'All dates',
                value: props.dates.length,
            }
        ]), [props.dates]);

    return (
        <>
            {
                edit ?
                    <FormCard
                    name={''}
                    edit={true}
                    editable={false}
                    setEdit={() => null}>
                        <SelectInput
                        className={'select'}
                        label={'Select dates'}
                        options={selectableDates}
                        multiple={true}
                        placeholder={'select dates on which category will be applied'}
                        value={selectedDates}
                        onChange={(dates: any[]) => setSelectedDates(dates.map((date) => date.value))}/>
                        {
                            selectedDates.length > 0 ?
                                <CategoryForm
                                newItem={true}
                                cancel={() => setEdit(false)}
                                confirm={(categoryItem: CategoryItem) => {
                                    props.onCategoryCreate(selectedDates, categoryItem);
                                    setEdit(false);
                                }}/> :
                                null
                        }
                    </FormCard> :
                    null
            }
            {
                props.editable && !edit ?
                    <Button
                        title={'Create New Category'}
                        variant={'secondary'}
                        onClick={() => setEdit(true)}/>
                    :
                    null
            }
        </>
    );
};
