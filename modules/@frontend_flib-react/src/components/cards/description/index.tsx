import * as React from 'react';
import Editor from 'rich-markdown-editor';
import Separator from '../../elements/separator';
import CardContainer from '../../elements/card-container';
import styled from '../../../config/styled';
import { getEditorTheme } from './theme';

export interface DescriptionProps extends React.ComponentProps<any> {
    removeBg?: boolean;
    color?: string;
    text: string;
    wSeparator?: boolean;
}

const H3 = styled.h3`
    margin-bottom: ${(props) => props.theme.regularSpacing};
    width: 100%;
`;

const Card = styled(CardContainer)`
    .editor {
        font-size: 14px;
        width: 100%;

        .heading-anchor {
            display: none;
        }

        a {
            text-decoration: underline;
        }

        hr {
            margin: ${props => props.theme.smallSpacing};
        }
    }
`;

export const Description: React.FunctionComponent<DescriptionProps> = (props: DescriptionProps): JSX.Element => {
    return (
        <Card removeBg={props.removeBg}>
            <H3>{props.title}</H3>
            <Editor
                readOnly
                className={'editor'}
                defaultValue={props.text}
                onChange={console.log}
                theme={getEditorTheme(props.color)}
            />
            {props.wSeparator && <Separator />}
        </Card>
    );
};
