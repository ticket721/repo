import React, { Dispatch, Fragment, useState } from 'react';
import styled                                  from 'styled-components';
import { Button } from '@frontend/flib-react/lib/components';

import { GlobalCategoryCard } from './GlobalCategoryCard';
import { CategoryItem }       from '../index';
import { CategoryForm }       from '../CategoryForm';
import { checkFormatDate }    from '@frontend/core/lib/utils/date';

interface GlobalCategoriesProps {
    categories: CategoryItem[];
    onGlobalCategoriesChange: (categories: CategoryItem[]) => void;
    onGlobalCategoryCreate: () => void;
}

export const GlobalCategories: React.FC<GlobalCategoriesProps> = (props: GlobalCategoriesProps) => {
    const [ editIdx, setEditIdx ]: [ number, Dispatch<number> ] = useState(null);
    const [ onNewCategory, setOnNewCategory ]: [ boolean, Dispatch<boolean> ] = useState(null);

    const resetEdition = () => {
        setEditIdx(null);
        setOnNewCategory(false);
    };

    const deleteCategory = (deleteIdx: number) => {
        const categories: CategoryItem[] = props.categories
            .filter((category: CategoryItem, idx: number) => deleteIdx !== idx);

        resetEdition();
        props.onGlobalCategoriesChange(categories);
    };

    const confirmCategory = (comfirmedIdx: number ,updateCategoryItem: CategoryItem) => {
        const categories: CategoryItem[] = props.categories.map((categoryItem: CategoryItem, idx) =>
            comfirmedIdx === idx ? updateCategoryItem : categoryItem
        );

        props.onGlobalCategoriesChange(categories);
        resetEdition();
    };
    return (
        <StyledGlobal>
            <Description>A Global Category corresponds to a ticket valid for all dates</Description>
            <CategoriesContainer>
                {
                  props.categories.map((globalCategory: CategoryItem, idx: number) => (
                      <Fragment key={`globalCategory-${idx}`}>
                          <GlobalCategoryCard
                          name={globalCategory.name}
                          price={globalCategory.currencies[0].price}
                          saleBegin={checkFormatDate(globalCategory.saleBegin)}
                          saleEnd={checkFormatDate(globalCategory.saleEnd)}
                          seats={globalCategory.seats}
                          edit={editIdx === idx}
                          editable={editIdx === null}
                          setEdit={() => setEditIdx(idx)}>
                              <CategoryForm
                              newItem={onNewCategory}
                              initialValues={globalCategory}
                              delete={() => deleteCategory(idx)}
                              cancel={() => resetEdition()}
                              confirm={(categoryItem: CategoryItem) => confirmCategory(idx, categoryItem)}/>
                          </GlobalCategoryCard>
                      </Fragment>
                ))
                }
            </CategoriesContainer>
            {
                editIdx === null ?
                    <Button
                    title={'Create New Global Category'}
                    variant={'secondary'}
                    onClick={() => {
                        setEditIdx(props.categories.length);
                        props.onGlobalCategoryCreate();
                        setOnNewCategory(true);
                    }}/>
                    :
                    null
            }
        </StyledGlobal>
    );
};

const StyledGlobal = styled.div`
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
