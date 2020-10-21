import { CustomDatePicker, TextInput, Toggle } from '@frontend/flib-react/lib/components';
import React from 'react';
import styled from 'styled-components';
import { LocationInput } from '@frontend/core/lib/components/LocationInput';
import { useDateCreationFields } from './useDateCreationFields';

export interface DateFieldsProps {
    idx: number;
    sigColors: string[];
}

export const DateFields: React.FC<DateFieldsProps> = ({ idx, sigColors }) => {
    const { eventBeginProps, eventEndProps, onlineProps, locationProps, onlineLinkProps } = useDateCreationFields(idx);

    return <>
        <DateRangeInput>
            <CustomDatePicker
            {...eventBeginProps}
            gradients={!!sigColors[0] ? sigColors : undefined}/>
            <CustomDatePicker
            {...eventEndProps}
            gradients={!!sigColors[0] ? sigColors : undefined}/>
        </DateRangeInput>
        <OnlineSwitch>
            <Toggle
            {...onlineProps}
            gradient={!!sigColors[0] ? sigColors : undefined} />
        </OnlineSwitch>
        {
            onlineProps.checked ?
            <TextInput
            {...onlineLinkProps}
            icon={'link'}
            iconColor={sigColors[0]} /> :
            <LocationInput
            {...locationProps}
            iconColor={sigColors[0]} />
        }
    </>;
}

const DateRangeInput = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: ${props => props.theme.biggerSpacing};

    & > div:first-child {
        margin-bottom: ${props => props.theme.regularSpacing};
    }
`;

const OnlineSwitch = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: ${props => props.theme.regularSpacing};

    & > div {
        width: fit-content;
    }
`;
