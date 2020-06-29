import React, { Dispatch, useEffect, useState } from 'react';
import { Button, SelectInput }                  from '@frontend/flib-react/lib/components';

import { CategoryForm, CategoryItem }   from '../../../../../components/CategoryForm';
import { checkFormatDate, displayDate } from '@frontend/core/lib/utils/date';
import { DateItem }                     from '../../DatesForm';
import { FormCard }                              from '../../../../../components/FormCard';

import { useTranslation } from 'react-i18next';
import '../locales';
import styled             from 'styled-components';

interface DateOption {
    label: string;
    value: number;
}

interface CreateSpecificCategoryProps {
    dates: DateItem[];
    editable: boolean;
    onCategoryCreate: (dates: number[], category: CategoryItem) => void;
}

export const CreateSpecificCategory: React.FC<CreateSpecificCategoryProps> = (props: CreateSpecificCategoryProps) => {
    const [ t ] = useTranslation('categories');
    const [ selectableDates, setSelectableDates ]: [ DateOption[], Dispatch<DateOption[]> ] = useState([]);
    const [ edit, setEdit ] = useState(null);
    const [ selectedDates, setSelectedDates ]: [ DateOption[], Dispatch<DateOption[]> ] = useState([]);

    useEffect(() =>
        setSelectableDates([
            ...props.dates.map((date: DateItem, idx: number) => ({
                label: `${date.name} - ${displayDate(checkFormatDate(date.eventBegin))}`,
                value: idx,
            }))
        ]), [props.dates, t]);

    useEffect(() => {
        if (selectableDates.length === 1) {
            setSelectedDates(selectableDates);
        }
    }, [selectableDates]);

    return (
        <CreateCategoryWrapper>
            {
                edit ?
                    <FormCard
                    name={''}
                    edit={true}
                    editable={false}
                    setEdit={() => null}>
                        <SelectInput
                        disabled={selectableDates.length === 1}
                        className={'select'}
                        label={t('select_dates_label')}
                        options={[
                            {
                                label: t('all_dates'),
                                value: -1,
                            },
                            ...selectableDates
                        ]}
                        multiple={true}
                        placeholder={t('select_dates_placeholder')}
                        value={selectedDates}
                        onChange={(dates: DateOption[]) => {
                            if (!dates) {
                                setSelectedDates([]);
                            } else if (dates.findIndex((date: DateOption) => date.value === -1) !== -1) {
                                setSelectedDates(selectableDates);
                            } else {
                                setSelectedDates(dates);
                            }
                        }
                        }/>
                        {
                            selectedDates.length > 0 ?
                                <CategoryForm
                                newItem={true}
                                maxDate={checkFormatDate(props.dates[selectedDates[0].value].eventEnd)}
                                cancel={() => setEdit(false)}
                                confirm={(categoryItem: CategoryItem) => {
                                    props.onCategoryCreate(selectedDates.map((dateOpt: DateOption) => dateOpt.value), categoryItem);
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
                        title={t('create_category')}
                        variant={'secondary'}
                        onClick={() => setEdit(true)}/>
                    :
                    null
            }
        </CreateCategoryWrapper>
    );
};

const CreateCategoryWrapper = styled.div`
    form {
        margin-top: ${props => props.theme.biggerSpacing};
    }
`;
