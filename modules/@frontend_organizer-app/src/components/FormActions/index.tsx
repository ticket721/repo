import React                  from 'react';
import { Button }             from '@frontend/flib-react/lib/components';
import styled                 from 'styled-components';
import { useTranslation }     from 'react-i18next';
import '../../shared/Translations/global';

export interface FormActionsProps{
    cancel?: () => void;
    newItem?: boolean;
    disabled?: boolean;
    delete?: () => void;
    loadingState?: boolean;
}

export const FormActions = (props: FormActionsProps) => {
  const [t] = useTranslation('global');

  return (
    <StyledFormActions>
      {
        !props.newItem && props.delete &&
        <div className={'delete-container'}>
            <Button
                title={t('delete_item')}
                variant={'danger'}
                onClick={props.delete}
            />
        </div>
      }
      <div className={'sub-container'}>
        {
          props.cancel &&
          <Button
              title={t('cancel')}
              variant={'secondary'}
              onClick={props.cancel}
          />
        }
        <Button
          type='submit'
          title={t('save_changes')}
          variant={props.disabled ? 'disabled' : 'primary'}
          loadingState={props.loadingState}
        />
      </div>
    </StyledFormActions>
  );
}

const StyledFormActions = styled.div`
    display: flex;
    justify-content: space-between;

    .delete-container {
        flex: 1;

        & > button {
            width: 60%;
        }
    }

    .sub-container {
        flex: 1;
        display: flex;

        & > button:first-child {
            flex: 1;
            margin-right: ${props => props.theme.regularSpacing};
        }

        & > button:last-child {
            flex: 2;
            margin-right: 0;
        }
    }
`;
