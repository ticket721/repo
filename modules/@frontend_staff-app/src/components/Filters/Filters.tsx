import React, { useEffect, useState }                 from 'react';
import styled                                         from 'styled-components';
import { CategoryItem, PushCategory, RemoveCategory } from '../../redux/ducks/current_event';
import { useTranslation }                             from 'react-i18next';
import { Toggle, Icon, Checkbox }                               from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector }                   from 'react-redux';
import { StaffAppState }                              from '../../redux';

interface FiltersProps {
    dateCategories: CategoryItem[],
    globalCategories: CategoryItem[],
    open: boolean;
    onClose: () => void;
}

export const Filters: React.FC<FiltersProps> = ({ dateCategories, globalCategories, open, onClose }: FiltersProps) => {
    const [ t ] = useTranslation('filters');
    const [ allCheckBox, setAllCheckbox ] = useState<boolean>(false);
    const filteredCategories = useSelector((state: StaffAppState) => state.currentEvent.filteredCategories);
    const dispatch = useDispatch();

    const selectAll = () => {
        dateCategories.forEach(category => {
            if (filteredCategories.findIndex(cat => cat.id === category.id) === -1) {
                updateFilteredCategories(true, category.id);
            }
        });
        globalCategories.forEach(category => {
            if (filteredCategories.findIndex(cat => cat.id === category.id) === -1) {
                updateFilteredCategories(true, category.id, true);
            }
        });
    };

    const updateFilteredCategories = (added: boolean, categoryId: string, global?: boolean) => {
        if (added) {
            const addedCategory = global ?
                globalCategories.find(category => category.id === categoryId) :
                dateCategories.find(category => category.id === categoryId);

            dispatch(PushCategory(addedCategory));
        } else {
            dispatch(RemoveCategory(categoryId));
        }
    };

    useEffect(() => {
        if (dateCategories.length + globalCategories.length === filteredCategories.length) {
            setAllCheckbox(true);
        } else {
            setAllCheckbox(false);
        }
    }, [filteredCategories.length, dateCategories.length, globalCategories.length]);

    return <FiltersContainer hide={!open}>
        {
            filteredCategories.length > 0 ?
                <Close onClick={onClose}>
                    <Icon
                        icon={'close'}
                        size={'12px'}
                        color={'#FFF'}/>
                </Close> :
                null
        }
        <Title>{t('filters_title')}</Title>
        <SubTitle>{t('filters_subtitle')}</SubTitle>
        <AllCheck>
            <Checkbox
                checked={allCheckBox}
                label={t('all_label')}
                name={'every-categories'}
                onChange={() => !allCheckBox ? selectAll() : null}/>
        </AllCheck>
        {
                dateCategories.map(category => (
                    <Toggle
                        checked={filteredCategories.findIndex(cat => cat.id === category.id) !== -1}
                        key={category.id}
                        label={category.name}
                        name={category.id}
                        onChange={(checked, id) => updateFilteredCategories(checked, id)}
                    />
                ))
        }
        {
            dateCategories.length > 0 && globalCategories.length > 0 ?
                <Separator/> :
                null
        }
        {
            globalCategories.map(category => (
                <Toggle
                    checked={filteredCategories.findIndex(cat => cat.id === category.id) !== -1}
                    key={category.id}
                    label={category.name}
                    name={category.id}
                    onChange={(checked, id) => updateFilteredCategories(checked, id, true)}
                />
            ))
        }
    </FiltersContainer>
};

const FiltersContainer = styled.div<{ hide: boolean }>`
    position: fixed;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(180deg, #120F1A, #0A0812);
    z-index: 11;
    padding: 0 ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
    top: ${props => props.hide ? '100vh' : '0'};
    transition: top 300ms ease-in;
`;

const Close = styled.div`
    position: absolute;
    top: calc(constant(safe-area-inset-top) + ${props => props.theme.regularSpacing});
    top: calc(env(safe-area-inset-top) + ${props => props.theme.regularSpacing});
    right: ${props => props.theme.regularSpacing};
`;

const Title = styled.h2`
    width: 100%;
    font-weight: bold;
    color: ${props => props.theme.textColor};
    font-family: ${props => props.theme.fontStack};
    margin-top: ${props => props.theme.regularSpacing};
    font-size: 16px;
    text-align: center;
`;

const SubTitle = styled.h3`
    margin: calc(2 * ${props => props.theme.biggerSpacing}) 0 ${props => props.theme.biggerSpacing};
    font-size: 24px;
    line-height: 30px;
    font-weight: 600;
`;

const AllCheck = styled.div`
    margin-bottom: ${props => props.theme.regularSpacing};

    label {
        font-size: 12px;
    }
`;

const Separator = styled.div`
    width: 100%;
    height: 2px;
    margin-bottom: ${props => props.theme.biggerSpacing};
    background-color: ${props => props.theme.darkerBg};
`;
