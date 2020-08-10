import * as React from 'react';
import styled from '../../../config/styled';
import RichTextEditor from 'react-rte';
// @ts-ignore
import EditorValue from 'react-rte/src/lib/EditorValue';
import { ChangeEvent } from 'react';

export interface RichTextProps extends React.ComponentProps<any> {
    error?: string;
    label: string;
    maxChar?: number;
    name: string;
    placeholder: string;
    value?: string;
    className?: string;
    onChange: (event: any) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
    onFocus?: (
        eventOrPath: string | ChangeEvent<any>,
    ) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
    onBlur?: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
}

const Error = styled.span`
    bottom: -16px;
    color: ${(props) => props.theme.errorColor.hex};
    font-size: 13px;
    font-weight: 500;
    left: 10px;
    position: absolute;
`;

const StyledLabel = styled.label`
    display: inline-flex;
    padding: 0;
    transform: translateX(-12px);
    transition: all 300ms ease;

    &::before {
        background-color: ${(props) => props.theme.primaryColor.hex};
        border-radius: 100%;
        content: '';
        display: inline-block;
        height: 4px;
        margin-right: 8px;
        opacity: 0;
        position: relative;
        top: 2px;
        transition: opacity 300ms ease;
        width: 4px;
    }
`;

const StyledTextarea = styled.div<RichTextProps>`
    position: relative;
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    flex-direction: column;
    padding-top: ${(props) => props.theme.biggerSpacing};
    transition: background-color 300ms ease;

    .editor {
        z-index: 2;
        background-color: transparent;
        border-radius: 0px;
        border: none;
        padding: ${(props) => props.theme.biggerSpacing};
        padding-top: ${(props) => props.theme.smallSpacing};
        color: ${(props) => props.theme.textColor};
        font-family: ${(props) => props.theme.fontStack};
        input {
            color: black;
            font-family: ${(props) => props.theme.fontStack};
        }
        .toolbar {
            margin: 0;
            button {
                background: ${(props) => props.theme.componentColorLight};
                border: 1px solid ${(props) => props.theme.componentColorLight};
            }
            button:disabled,
            button[disabled] {
                background: ${(props) => props.theme.componentColorLighter};
            }
            button:active,
            button[class*="IconButton__isActive__"] {
                background: ${(props) => props.theme.textColorDark};
            }
            select {
                border: 1px solid ${(props) => props.theme.componentColorLight};
                color: ${(props) => props.theme.textColorDark};
                padding: 0 ${(props) => props.theme.biggerSpacing} 0 ${(props) => props.theme.smallSpacing};
            }
        }
    }
    .DraftEditor-root {
        height: 300px;
    }

    ${(props) =>
        props.error &&
        `
    ${StyledLabel}{
      color: ${props.theme.errorColor.hex};
      transform: translateX(0px);

      &::before {
        background-color: ${props.theme.errorColor.hex};
        opacity: 1;
      }
    }
  `}

    &:hover {
        background-color: ${(props) => props.theme.componentColorLight};
    }

    &:focus-within {
        background-color: ${(props) => props.theme.componentColorLighter};

        ${StyledLabel} {
            transform: translateX(0px);

            &::before {
                opacity: 1;
            }
        }
    }
`;

const LabelsContainer = styled.div`
    color: ${(props) => props.theme.textColorDarker};
    display: flex;
    font-size: 11px;
    font-weight: 700;
    justify-content: space-between;
    padding: 0 ${(props) => props.theme.biggerSpacing};
`;

type StyleConfig = {
    label: string;
    style: string;
    className?: string;
};
type GroupName =
    | 'INLINE_STYLE_BUTTONS'
    | 'BLOCK_TYPE_BUTTONS'
    | 'LINK_BUTTONS'
    | 'BLOCK_TYPE_DROPDOWN'
    | 'HISTORY_BUTTONS'
    | 'IMAGE_BUTTON';
type ToolbarConfig = {
    display: Array<GroupName>;
    INLINE_STYLE_BUTTONS: Array<StyleConfig>;
    BLOCK_TYPE_DROPDOWN: Array<StyleConfig>;
    BLOCK_TYPE_BUTTONS: Array<StyleConfig>;
};

export const RichText: React.FunctionComponent<RichTextProps> = (props: RichTextProps): JSX.Element => {
    const [value, setValue] = React.useState(() =>
        !props.value || props.value?.length === 0
            ? RichTextEditor.createEmptyValue()
            : RichTextEditor.createValueFromString(props.value, 'markdown'),
    );
    const [count, setCount] = React.useState(props.value ? value.toString('markdown').length : 0);

    const onChange = (editorvalue: EditorValue) => {
        const text = editorvalue.toString('markdown');
        setCount(text.length);
        if ((props.maxChar && text.length <= props.maxChar) || !props.maxChar) {
            setValue(editorvalue);
            if (props.onChange) {
                props.onChange(text);
            }
        } else {
            setValue(value);
        }
    };

    React.useEffect(() => {
        if (props.maxChar && count > props.maxChar) {
            setValue(value);
        }
    }, [count]);

    const toolbarConfig: ToolbarConfig = {
        display: [
            'INLINE_STYLE_BUTTONS',
            'BLOCK_TYPE_BUTTONS',
            'BLOCK_TYPE_DROPDOWN',
            'LINK_BUTTONS',
            'HISTORY_BUTTONS',
        ],
        INLINE_STYLE_BUTTONS: [
            { label: 'Bold', style: 'BOLD' },
            { label: 'Italic', style: 'ITALIC' },
        ],
        BLOCK_TYPE_DROPDOWN: [
            { label: 'Normal', style: 'unstyled' },
            { label: 'Heading Large', style: 'header-one' },
            { label: 'Heading Medium', style: 'header-two' },
            { label: 'Heading Small', style: 'header-three' },
        ],
        BLOCK_TYPE_BUTTONS: [{ label: 'UL', style: 'unordered-list-item' }],
    };

    return (
        <StyledTextarea error={props.error} className={props.className}>
            <LabelsContainer>
                <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>
                {props.maxChar && value.toString('markdown').length >= props.maxChar - 20 && (
                    <span>{props.maxChar - value.toString('markdown').length} char left</span>
                )}
            </LabelsContainer>

            <RichTextEditor
                editorClassName={'textarea'}
                className={'editor'}
                value={value}
                onChange={onChange}
                toolbarConfig={toolbarConfig}
                toolbarClassName={'toolbar'}
                placeholder={props.placeholder}
            />
            {props.error && <Error>{props.error}</Error>}
        </StyledTextarea>
    );
};

export default RichText;
