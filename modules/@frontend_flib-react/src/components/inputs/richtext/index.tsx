import * as React from 'react';
import styled from '../../../config/styled';
import Editor from 'rich-markdown-editor';
import debounce from 'lodash.debounce';
import { getEditorTheme } from './theme';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useRef } from 'react';
import RichMarkdownEditor from 'rich-markdown-editor';

export interface RichTextProps extends React.ComponentProps<any> {
    error?: string;
    label: string;
    maxChar?: number;
    name: string;
    placeholder: string;
    color?: string;
    value?: string;
    hasNoInitialValue?: boolean;
    className?: string;
    lng: string;
    uploadImage?: (file: File) => Promise<string>;
    onChange: (output: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
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

const StyledRichText = styled.div<RichTextProps>`
    position: relative;
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    flex-direction: column;
    padding-top: ${(props) => props.theme.biggerSpacing};
    transition: background-color 300ms ease;

    .editor {
        font-size: 14px;
        margin: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};

        .block-menu-trigger {
            display: none;
        }

        .ProseMirror-selectednode {
            outline: none;
        }

        a {
            text-decoration: underline;
        }

        hr {
            margin: ${(props) => props.theme.smallSpacing};
        }
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

const CircleProgress = styled(CircularProgressbar)<{ progress: number }>`
    position: absolute;
    right: ${props => props.theme.regularSpacing};
    bottom: ${props => props.theme.regularSpacing};
    width: 32px;

    transition: width 300ms ease;

    .CircularProgressbar-path {
        stroke: ${props => {
            if (props.progress >= 1) {
                return props.theme.errorColor.hex;
            }

            if (props.progress > 0.9) {
                return props.theme.warningColor.hex;
            }

            return props.theme.primaryColor.hex;
        }};
    }

    .CircularProgressbar-trail {
        stroke: ${props => props.theme.componentColorLight};
    }

    .CircularProgressbar-text {
        fill: ${props => props.theme.textColor};
        font-size: ${props => props.progress > 1 ? '300%' : '200%'};
        font-weight: ${props => props.progress > 1 ?
            600 :
            400
        };
    }

    .CircularProgressbar-background {
        fill: ${props => props.progress > 1 ? props.theme.errorColor.hex : 'transparent'};
    }
`;

const frenchDictionory = {
    bulletList: 'Liste à puces',
    codeCopied: 'Copié',
    createLink: 'Créer un lien',
    createLinkError: 'Désolé, une erreur est survenue durant la création du lien',
    em: 'Italique',
    h1: 'Gros titre',
    h2: 'Titre moyen',
    h3: 'Petit titre',
    heading: 'Titre',
    hr: 'Séparateur',
    image: 'Image',
    imageUploadError: "Désolé, une erreur est survenue durant l'upload de l'image",
    info: 'Info',
    infoNotice: 'Remarque informative',
    link: 'Lien',
    linkCopied: 'Lien copié',
    mark: 'Surbrillance',
    newLineEmpty: "Selectionnez le texte pour plus d'options (gras, italique,...)",
    newLineWithSlash: 'Tapez pour filtrer',
    noResults: 'Aucun résultat',
    openLink: 'Ouvrir le lien',
    orderedList: 'Liste numérotée',
    pasteLink: 'Lien collé',
    placeholder: 'Placeholder',
    quote: 'Citation',
    removeLink: 'Retirer le lien',
    searchOrPasteLink: 'Lien ou #tag',
    strikethrough: 'Barré',
    strong: 'Gras',
    subheading: 'Sous Titre',
    tip: 'Astuce',
    tipNotice: 'Astuce',
    warning: 'Avertissement',
    warningNotice: "Remarque d'avertissement",
};

export const RichText: React.FunctionComponent<RichTextProps> = (props: RichTextProps): JSX.Element => {
    const editorRef = useRef<RichMarkdownEditor>(null);
    return (
        <StyledRichText error={props.error} className={props.className} color={props.color}>
            <LabelsContainer>
                <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>
            </LabelsContainer>
            <Editor
                ref={editorRef}
                className={'editor'}
                theme={getEditorTheme(props.color)}
                placeholder={props.placeholder}
                defaultValue={props.value}
                dictionary={
                    props.lng === 'fr'
                        ? frenchDictionory
                        : {
                              newLineEmpty: 'Select text for more options (bold, italic,...)',
                              newLineWithSlash: 'Tap to filter',
                              searchOrPasteLink: 'link or #tag',
                          }
                }
                onChange={debounce((value) => {
                    const output = value();
                    props.onChange(output);
                }, 200)}
                onKeyDown={(e) => {
                    if (
                        editorRef.current &&
                        props.maxChar &&
                        editorRef.current.value().length >= props.maxChar &&
                        e.key !== 'Backspace' &&
                        e.key !== 'Shift' &&
                        e.key !== 'Alt' &&
                        e.key !== 'Meta' &&
                        e.key !== 'ArrowLeft' &&
                        e.key !== 'ArrowUp' &&
                        e.key !== 'ArrowDown' &&
                        e.key !== 'ArrowRight'
                    ) {
                        e.preventDefault();
                    }
                }}
                handleDOMEvents={{
                    focus: () => {
                        const blockMenu = document.getElementById('block-menu-container');
                        if (blockMenu) {
                            blockMenu.style.pointerEvents = 'all';
                            blockMenu.style.bottom = '24px';
                        }
                        if (props.onFocus) {
                            props.onFocus();
                        }
                        return true;
                    },
                    blur: (_, e) => {
                        const blockMenu = document.getElementById('block-menu-container');
                        if (blockMenu) {
                            blockMenu.style.bottom = '-800px';
                        }
                        if (props.onBlur) {
                            props.onBlur();
                        }
                        return true;
                    },
                }}
                uploadImage={props.uploadImage}
            />
            {props.maxChar && props.value ? (
                <CircleProgress
                    progress={props.value.length / props.maxChar}
                    background
                    text={
                        props.value.length > props.maxChar
                            ? '!'
                            : props.value.length / props.maxChar > 0.9
                            ? (props.maxChar - props.value.length).toString()
                            : undefined
                    }
                    maxValue={props.maxChar}
                    strokeWidth={10}
                    value={props.value.length}
                />
            ) : null}
            {props.error && <Error>{props.error}</Error>}
        </StyledRichText>
    );
};

export default RichText;
