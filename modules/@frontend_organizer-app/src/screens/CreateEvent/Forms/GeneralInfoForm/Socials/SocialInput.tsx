import React, { useEffect } from 'react';
import { TextInput, Icon }  from '@frontend/flib-react/lib/components';
import styled                      from 'styled-components';
import { IconColor } from '@frontend/flib-react/lib/components/icon';
import { useTranslation } from 'react-i18next';
import './locales';
import { useField } from 'formik';
import { evaluateError } from '../../../../../utils/extractError';

export interface SocialInputProps {
    name: string;
    color: IconColor;
    options?: any;
    pattern?: string;
}

export const SocialInput: React.FC<SocialInputProps> = ({ name, color, options }: SocialInputProps) => {
    const [ t ] = useTranslation(['socials', 'errors']);


    const [ field, meta, helper ] = useField<string>(`textMetadata.${name}`);

    useEffect(() => {
        document.getElementsByClassName(name)[0].getElementsByTagName('input')[0].focus();

        return () => {
            helper.setError(null);
            setTimeout(() => helper.setTouched(false), 200);
        }
    // eslint-disable-next-line
    }, [name]);

    return (
        <SocialInputContainer>
            <TextInput
            {...field}
            className={name}
            value={field.value}
            onChange={options ? (e) => helper.setValue(e.target.value.substring(options.prefix.length)) :
                field.onChange
            }
            onBlur={() => {
                setTimeout(() => helper.setTouched(true), 200);
            }}
            label={t(`${name}_label`)}
            placeholder={t(`${name}_placeholder`)}
            icon={name}
            iconColor={color}
            options={options}
            error={evaluateError(meta)}
            />
            <Close onClick={() => helper.setValue(undefined)}>
                <Icon icon={'close'} size={'16px'} color={'#FFF'}/>
            </Close>
        </SocialInputContainer>
    );
};

const SocialInputContainer = styled.div`
    position: relative;
    display:flex;
    align-items: center;
    margin-bottom: ${props => props.theme.biggerSpacing};
`;

const Close = styled.div`
    position: absolute;
    right: ${props => props.theme.doubleSpacing};
    cursor: pointer;
    opacity: 0.7;

    :hover {
        opacity: 1;
    }
`;
