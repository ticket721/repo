import React                  from 'react';
import { Button }             from '@frontend/flib-react/lib/components';
import styled                 from 'styled-components';

export interface FormActionsProps{
    cancel: () => void;
    newItem?: boolean;
    disabled?: boolean;
    delete?: () => void;
}

export const FormActions = (props: FormActionsProps) => (
    <StyledFormActions>
        {
            !props.newItem ?
                <Button
                title='Delete item'
                variant={'danger'}
                onClick={props.delete}
                /> :
                <div/>
        }
        <div className={'sub-container'}>
            <Button
            title='Cancel'
            variant={'secondary'}
            onClick={props.cancel}
            />
            <Button
            type='submit'
            title='Save changes'
            variant={props.disabled ? 'disabled' : 'primary'}
            />
        </div>
    </StyledFormActions>
);

const StyledFormActions = styled.div`
    display: flex;
    justify-content: space-between;

    & > button {
        width: 30%;
    }

    .sub-container {
        width: 50%;
        display: flex;

        & > button:first-child {
            flex: 1;
            margin-right: ${props => props.theme.regularSpacing};
        }

        & > button:last-child {
            flex: 2;
        }
    }
`;
