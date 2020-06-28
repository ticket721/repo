import React, { Fragment, useState } from 'react';
import styled                                                         from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';

import { CategoryForm, CategoryItem }   from '../../../../../components/CategoryForm';
import { checkFormatDate, displayDate } from '@frontend/core/lib/utils/date';
import { useSelector }                  from 'react-redux';
import { OrganizerState }               from '../../../../../redux/ducks';
import { DateItem }                     from '../../DatesForm';
import { CreateSpecificCategory }       from './CreateSpecificCategory';
import { CategoryCard }                 from '../../../../../components/CategoryCard';

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
            <CategoriesContainer>
                {
                    dates.map((date: DateItem, dateIdx: number) => {
                        if (props.categories[dateIdx] && props.categories[dateIdx].length > 0) {
                            return (
                                <DateSection key={`date-${dateIdx}`}>
                                    <span>{date.name}</span>
                                    <DateDetails>
                                        <span>{displayDate(checkFormatDate(date.eventBegin))}</span>
                                        <Arrow
                                            icon={'arrow'}
                                            size={'14px'}
                                            color={'#FFF'}/>
                                        <span>{displayDate(checkFormatDate(date.eventEnd))}</span>
                                    </DateDetails>
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
                                                    maxDate={checkFormatDate(date.eventEnd)}
                                                    delete={deleteCategory}
                                                    cancel={resetEdition}
                                                    confirm={updateCategory}/>
                                            </CategoryCard>
                                        </Fragment>
                                    ))
                                }
                                </DateSection>
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

    button {
        margin-top: ${props => props.theme.regularSpacing};
        width: calc(50% - ${props => props.theme.regularSpacing});
    }
`;

const CategoriesContainer = styled.div`
    width: 100%;

    & > div {
        margin-bottom: ${props => props.theme.regularSpacing};
    }
`;

const DateSection = styled.div`
    font-weight: 500;

    & > span {
        display: block;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: ${props => props.theme.regularSpacing};
    }
`;

const DateDetails = styled.div`
    display: flex;
    margin-bottom: ${props => props.theme.regularSpacing};
    font-size: 14px;

    & > span:first-child, & > span:last-child {
        margin-top: 2px;
    }
`;

const Arrow = styled(Icon)`
    margin: 0 5px;
`;
