import React, { ChangeEvent } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { TextInput } from '@frontend/flib-react/lib/components';

export interface LocationInputProps {
    name: string;
    label: string;
    onSelect: (selection: any) => void;
    initialValue?: string;
    className?: string;
    placeholder?: string;
    error?: string;
    onFocus?: (
        eventOrPath: string | ChangeEvent<any>,
    ) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
}

export const LocationInput: React.FC<LocationInputProps> = (props: LocationInputProps) => (
    <GooglePlacesAutocomplete
        debounce={500}
        initialValue={props.initialValue}
        placeholder={props.placeholder}
        renderInput={(locationProps) => (
            <TextInput
                icon={'pin'}
                name={props.name}
                label={props.label}
                className={props.className}
                error={props.error}
                onFocus={props.onFocus}
                {...locationProps}
            />
        )}
        onSelect={props.onSelect}
    />
);
