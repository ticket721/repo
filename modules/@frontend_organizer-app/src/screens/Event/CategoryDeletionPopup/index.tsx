import { Popup, Button }              from '@frontend/flib-react/lib/components';
import React, { useState } from 'react';
import styled                         from 'styled-components';

import { useTranslation }      from 'react-i18next';
import './locales';

import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 }                       from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { useDeepEffect }            from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }         from '@frontend/core/lib/redux/ducks/notifications';
import { useHistory, useParams } from 'react-router';
import { AppState } from '@frontend/core/lib/redux';

interface CategoryDeletionPopupProps{
    parentType: 'event' | 'date';
    parentId: string;
    categoryId: string;
    categoryName: string;
    open: boolean;
    onClose: () => void;
}

export const CategoryDeletionPopup: React.FC<CategoryDeletionPopupProps> =
    ({ parentType, parentId, categoryId, categoryName, open, onClose }: CategoryDeletionPopupProps) => {
    const [ t ] = useTranslation('category_deletion');
    const history = useHistory();
    const dispatch = useDispatch();
    const { groupId, dateId } = useParams();

    const [uuid] = useState(v4() + '@delete-category');
    const token = useSelector((state: AppState): string => state.auth.token.value);
    const { lazyRequest: deleteCategory, response } = useLazyRequest(`${parentType}s.deleteCategories`, uuid);

    useDeepEffect(() => {
        if (response.data) {
            dispatch(PushNotification(t('successful_deletion', { categoryName }), 'success'));
            onClose();
        }
    }, [response.data]);

    useDeepEffect(() => {
        if (response.error) {
            dispatch(PushNotification(t('error_deletion'), 'error'));
        }
    }, [response.error]);

    return (
        <>
            {
                open ?
                    <Popup>
                        <span>{t('confirm_deletion_msg', { categoryName })}</span>
                        <Buttons>
                            <Button
                                title={t('cancel_btn')}
                                variant={'secondary'}
                                onClick={onClose}/>
                            <Button
                                title={t('delete_btn')}
                                variant={'danger'}
                                loadingState={response.loading}
                                onClick={() => {
                                    deleteCategory([
                                        token,
                                        parentId,
                                        {
                                            categories: [categoryId]
                                        }
                                    ]);
                                    history.push(`/group/${groupId}/date/${dateId}`)
                                }}/>
                        </Buttons>
                    </Popup> :
                    null
            }
        </>
    );
};

const Buttons = styled.div`
    width: 100%;
    margin-top: ${props => props.theme.biggerSpacing};
    display: flex;
    justify-content: flex-end;

    & > button {
        width: 40%;
        margin-left: ${props => props.theme.regularSpacing};
    }
`;
