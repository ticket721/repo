import * as React from 'react';
import styled from '../../../config/styled';
import slugify from 'slugify';
import Icon from '../../icon';

export interface SelectableListItem {
    label: string;
    value: any;
}

export interface SelectableListProps extends React.ComponentProps<any> {
    title: string;
    mainColor?: string;
    items: SelectableListItem[];
    selected?: string;
    update: (value: any) => void;
}

const Container = styled.section`
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    h2 {
        padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing}
            ${(props) => props.theme.smallSpacing};
    }
`;

const CheckIcon = styled(Icon)`
    height: 12px;
    margin-left: auto;
    opacity: 0;
    transition: opacity 300ms ease;
`;

const Item = styled.li`
    align-items: center;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    font-size: 14px;
    font-weight: 500;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
    transition: background-color 300ms ease;
    width: 100%;

    &.selected {
        background-color: ${(props) => props.theme.componentColorLight};

        ${CheckIcon} {
            opacity: 1;
        }
    }
`;

export const SelectableList: React.FunctionComponent<SelectableListProps> = (
    props: SelectableListProps,
): JSX.Element => {
    return (
        <Container>
            <h2>{props.title}</h2>
            <ul className={'row'}>
                {props.items.map((item, idx: number) => {
                    return (
                        <Item
                            key={slugify(`${item.label}-${idx}`)}
                            className={item.value === props.selected ? 'selected' : ''}
                            onClick={() => {
                                return props.update(item.value);
                            }}
                        >
                            {item.label}
                            <CheckIcon icon={'check'} size={'12px'} color={'rgba(255, 255, 255, 0.38)'} />
                        </Item>
                    );
                })}
            </ul>
        </Container>
    );
};

SelectableList.defaultProps = {
    mainColor: '#079CF0',
};

export default SelectableList;
