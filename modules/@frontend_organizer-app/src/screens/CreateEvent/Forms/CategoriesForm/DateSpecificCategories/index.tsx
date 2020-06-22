import React, { Fragment, useState } from 'react';
import styled                                                         from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';

import { CategoryItem }                 from '../index';
import { CategoryForm }                 from '../CategoryForm';
import { checkFormatDate, displayDate } from '@frontend/core/lib/utils/date';
import { CategoryCard }       from '../CategoryCard';
import { useSelector }        from 'react-redux';
import { OrganizerState }     from '../../../../../redux/ducks';
import { DateItem }           from '../../DatesForm';
import { CreateSpecificCategory } from './CreateSpecificCategory';

interface DateSpecificCategoriesProps {
    categories: CategoryItem[][];
    onCategoriesChange: (categories: CategoryItem[][]) => void;
}

export const DateSpecificCategories: React.FC<DateSpecificCategoriesProps> = (props: DateSpecificCategoriesProps) => {
    const dates: DateItem[] = useSelector((state: OrganizerState) => state.eventCreation.datesConfiguration.dates);
    const [ editDateIdx, setEditDateIdx ] = useState(null);
    const [ editCategoryIdx, setEditCategoryIdx ] = useState(null);

    const resetEdition = () => {
        setEditDateIdx(null);
        setEditCategoryIdx(null);
    };

    const deleteCategory = () => {
        const updatedCategories: CategoryItem[][] = props.categories
            .map((categories: CategoryItem[], dateIdx: number) =>
                dateIdx === editDateIdx ?
                    props.categories[dateIdx].filter((categoryItem: CategoryItem, categoryIdx: number) =>
                        categoryIdx !== editCategoryIdx
                    ) :
                    categories
            );

        resetEdition();
        props.onCategoriesChange(updatedCategories);
    };

    const updateCategory = (updateCategoryItem: CategoryItem) => {
        const updatedCategories: CategoryItem[][] = props.categories
            .map((categories: CategoryItem[], dateIdx: number) =>
                dateIdx === editDateIdx ?
                    props.categories[dateIdx].map((categoryItem: CategoryItem, categoryIdx: number) =>
                        categoryIdx === editCategoryIdx ? updateCategoryItem : categoryItem
                    ) :
                    categories
            );

        props.onCategoriesChange(updatedCategories);
        resetEdition();
    };

    const createCategories = (datesIdxs: number[], createCategory: CategoryItem) => {
        const updatedCategories: CategoryItem[][] = props.categories
            .map((categories: CategoryItem[], dateIdx: number) =>
                datesIdxs.includes(dateIdx) ? [
                    ...props.categories[dateIdx],
                    createCategory
                ] :
                categories
            );

        props.onCategoriesChange(updatedCategories);
        resetEdition();
    };

    return (
        <StyledDateSpecific>
            <Description>A Normal ticket corresponds to a category which can be applied to several dates</Description>
            <CategoriesContainer>
                {
                    dates.map((date: DateItem, dateIdx: number) => {
                        if (props.categories[dateIdx] && props.categories[dateIdx].length > 0) {
                            return (
                                <div key={`date-${dateIdx}`}>
                                    <span>{date.name}</span>
                                    <div>
                                        <span>{displayDate(checkFormatDate(date.eventBegin))}</span>
                                        <Icon
                                            icon={'arrow'}
                                            size={'16px'}
                                            color={'#FFF'}/>
                                        <span>{displayDate(checkFormatDate(date.eventEnd))}</span>
                                    </div>
                                    {
                                        props.categories[dateIdx].map((category: CategoryItem, categoryIdx: number) => (
                                            <Fragment key={`dateSpecificCategory-${categoryIdx}`}>
                                                <CategoryCard
                                                    name={category.name}
                                                    price={parseInt(category.currencies[0].price, 10) / 100}
                                                    saleBegin={checkFormatDate(category.saleBegin)}
                                                    saleEnd={checkFormatDate(category.saleEnd)}
                                                    seats={category.seats}
                                                    edit={
                                                        editDateIdx === dateIdx &&
                                                        editCategoryIdx === categoryIdx
                                                    }
                                                    editable={editCategoryIdx === null}
                                                    setEdit={() => {
                                                        setEditDateIdx(dateIdx);
                                                        setEditCategoryIdx(categoryIdx);
                                                    }}>
                                                    <CategoryForm
                                                        initialValues={category}
                                                        delete={deleteCategory}
                                                        cancel={resetEdition}
                                                        confirm={updateCategory}/>
                                                </CategoryCard>
                                            </Fragment>
                                        ))
                                    }
                                </div>
                            )
                        }

                        return null;
                    })
                }
            </CategoriesContainer>
            <CreateSpecificCategory
            dates={dates}
            editable={editCategoryIdx === null}
            onCategoryCreate={createCategories}/>
        </StyledDateSpecific>
    );
};

const StyledDateSpecific = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: ${props => props.theme.doubleSpacing};

    button {
        margin-top: ${props => props.theme.regularSpacing};
        width: calc(50% - ${props => props.theme.regularSpacing});
    }
`;

const Description = styled.span`
    padding-bottom: ${props => props.theme.regularSpacing};
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
`;

const CategoriesContainer = styled.div`
    width: 100%;

    & > div {
        margin-bottom: ${props => props.theme.regularSpacing};
    }

    & > div:last-child {
        margin-bottom: 0;
    }
`;
