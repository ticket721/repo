import React                              from 'react';
import { CategoryEntity }                 from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { DateEntity }                     from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { TicketCategoryDetails }          from './TicketCategoryDetails';
import { HapticsImpactStyle, useHaptics } from '@frontend/core/lib/hooks/useHaptics';

export interface TicketDateCategoryListProps {
    date: DateEntity;
    selection: number;
    categories: CategoryEntity[];
    setSelection: (value: {selection: number, category: CategoryEntity}) => void;
}

export const TicketDateCategoryList: React.FC<TicketDateCategoryListProps> = (props: TicketDateCategoryListProps): JSX.Element => {

    const haptics = useHaptics();

    const categoriesList = props.categories.map((category: CategoryEntity, idx: number): JSX.Element => {
        return <TicketCategoryDetails
            key={idx}
            idx={idx}
            category={category}
            onClick={() => {
                haptics.impact({
                    style: HapticsImpactStyle.Light
                })
                props.setSelection({ selection: idx, category })
            }}
            selection={props.selection}
            date={props.date}
        />
    });

    return <>
        {categoriesList}
    </>;
};
