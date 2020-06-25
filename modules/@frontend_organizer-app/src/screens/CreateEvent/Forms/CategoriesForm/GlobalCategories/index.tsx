import React, { Dispatch, Fragment, useState } from 'react';
import styled                                  from 'styled-components';

import { CategoryItem }         from '../index';
import { CategoryForm }         from '../CategoryForm';
import { checkFormatDate }      from '@frontend/core/lib/utils/date';
import { CategoryCard }         from '../CategoryCard';
import { CreateGlobalCategory } from './CreateGlobalCategory';
import { useSelector }          from 'react-redux';
import { OrganizerState }       from '../../../../../redux/ducks';

interface GlobalCategoriesProps {
    categories: CategoryItem[];
    onCategoriesChange: (categories: CategoryItem[]) => void;
}

export const GlobalCategories: React.FC<GlobalCategoriesProps> = (props: GlobalCategoriesProps) => {
    const maxDate: Date = useSelector((state: OrganizerState) =>
        state.eventCreation.datesConfiguration.dates[state.eventCreation.datesConfiguration.dates.length - 1].eventEnd);
    const [ editIdx, setEditIdx ]: [ number, Dispatch<number> ] = useState(null);

    const resetEdition = () => {
        setEditIdx(null);
    };

    const deleteCategory = () => {
        const categories: CategoryItem[] = props.categories
            .filter((category: CategoryItem, idx: number) => editIdx !== idx);

        resetEdition();
        props.onCategoriesChange(categories);
    };

    const updateCategory = (updateCategoryItem: CategoryItem) => {
        const categories: CategoryItem[] = props.categories.map((categoryItem: CategoryItem, idx) =>
            editIdx === idx ? updateCategoryItem : categoryItem
        );

        props.onCategoriesChange(categories);
        resetEdition();
    };

    const createCategories = (createCategory: CategoryItem) => {
        const updatedCategories: CategoryItem[] = [
            ...props.categories,
            createCategory,
        ];

        props.onCategoriesChange(updatedCategories);
        resetEdition();
    };

    return (
        <StyledGlobal>
            <CategoriesContainer>
                {
                  props.categories.map((globalCategory: CategoryItem, idx: number) => (
                      <Fragment key={`globalCategory-${idx}`}>
                          <CategoryCard
                          name={globalCategory.name}
                          price={parseInt(globalCategory.currencies[0].price, 10) / 100}
                          saleBegin={checkFormatDate(globalCategory.saleBegin)}
                          saleEnd={checkFormatDate(globalCategory.saleEnd)}
                          seats={globalCategory.seats}
                          edit={editIdx === idx}
                          editable={editIdx === null}
                          setEdit={() => setEditIdx(idx)}>
                              <CategoryForm
                              initialValues={globalCategory}
                              maxDate={checkFormatDate(maxDate)}
                              delete={deleteCategory}
                              cancel={resetEdition}
                              confirm={updateCategory}/>
                          </CategoryCard>
                      </Fragment>
                ))
                }
            </CategoriesContainer>
            <CreateGlobalCategory
            maxDate={checkFormatDate(maxDate)}
            editable={editIdx === null}
            onCategoryCreate={createCategories}/>
        </StyledGlobal>
    );
};

const StyledGlobal = styled.div`
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
