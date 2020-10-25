import React from 'react';
import styled                                           from 'styled-components';

import { FilesUploader, ColorPicker } from '@frontend/flib-react/lib/components';
import { ComponentsPreview } from './ComponentsPreview';

import { useStylesCreationFields } from './useStylesCreationFields';

export const StylesForm: React.FC = () => {
    const { avatarProps, primaryColorProps, secondaryColorProps, preview } = useStylesCreationFields();

    return (
        <StylesContainer>
            <FilesUploader {...avatarProps} />
            <ColorPickerContainer disabled={!preview}>
                <ColorPicker {...primaryColorProps} />
                <ColorPicker {...secondaryColorProps} />
            </ColorPickerContainer>
            {
                preview && primaryColorProps.color !== '' &&
                <ComponentsPreview
                previewSrc={preview}
                colors={[
                    primaryColorProps.color,
                    secondaryColorProps.color
                ]}
                />
            }
        </StylesContainer>
    );
};

const StylesContainer = styled.div`
    > div {
        margin-bottom: 35px
    }
`;

const ColorPickerContainer = styled.div<{ disabled: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    & > div:first-child,
    & > div:last-child {
        width: calc(50% - 25px);
    }

    opacity: ${props => props.disabled ? 0.3 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
`;
