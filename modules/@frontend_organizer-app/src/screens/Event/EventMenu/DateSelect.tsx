import * as React from 'react';
import Select     from 'react-select';
import styled     from 'styled-components';

const customStyles = {
    container: () => ({
        backgroundColor: '#1B1726',
        position: 'relative' as 'relative',
    }),
    option: () => ({
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.6)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        paddingBottom: 8,
        paddingTop: 8,
        transition: 'all 300ms ease',

        ':hover': {
            color: 'rgba(255, 255, 255, 0.9)',
        },
    }),
    control: () => ({
        display: 'flex',
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
    }),
    indicatorsContainer: () => ({
        display: 'flex',
        position: 'relative' as 'relative',
        top: '-1px',
        transform: 'rotate(-90deg)',
        '& > div': {
            padding: 0,
        },
    }),
    indicatorSeparator: () => ({
        border: 'none',
    }),
    input: () => ({
        color: 'transparent',
        fontSize: 14,
    }),
    menu: () => ({
        backgroundColor: '#1B1726',
        borderRadius: 8,
        marginTop: 8,
        zIndex: 3,
        position: 'absolute' as 'absolute',
        width: 'fit-content',
    }),
    menuList: () => ({
        margin: '16px 24px',
        paddingLeft: 16,
        borderLeft: '2px solid rgba(255,255,255,0.1)',
        maxHeight: 300,
        overflow: 'auto',
    }),
    valueContainer: () => ({
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        padding: 0,
        flexWrap: 'wrap' as 'wrap',
    }),
    singleValue: () => ({
        fontSize: 14,
        fontWeight: 600,
        marginRight: 8,
        opacity: 0.9,
    }),
};

export interface DateSelectProps extends React.ComponentProps<any> {
    defaultValue?: object;
    error?: string | undefined;
    label?: string;
    options: Array<object>;
    placeholder?: string;
    searchable?: boolean;
    multiple?: boolean;
    value?: Array<object>;
    className?: string;
    menuPosition?: {
        top?: string,
        right?: string,
        bottom?: string,
        left?: string,
    }
}

const StyledLabel = styled.label`
    display: inline-flex;
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

const Error = styled.span`
    top: 110%;
    color: ${(props) => props.theme.errorColor.hex};
    font-size: 13px;
    font-weight: 500;
    left: 10px;
    position: absolute;
`;

const StyledInputContainer = styled.div<DateSelectProps>`
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    flex-direction: column;
    padding-top: ${(props) => (props.label ? props.theme.biggerSpacing : 0)};
    transition: background-color 300ms ease;
    [class*='dummyInput'] {
        display: none;
    }
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

    ${props => props.menuPosition ?
        `& [class$=Menu] {
                top: ${props.menuPosition.top};
                bottom: ${props.menuPosition.bottom};
                right: ${props.menuPosition.right};
                left: ${props.menuPosition.left};
        }
        `: null
    }
`;

export const DateSelect: React.FunctionComponent<DateSelectProps> = (props: DateSelectProps): JSX.Element => {
    return (
        <StyledInputContainer label={props.label} className={props.className} menuPosition={props.menuPosition}>
            {props.label && <StyledLabel>{props.label}</StyledLabel>}
            <Select
                isMulti={props.multiple}
                value={props.value}
                defaultValue={props.defaultValue}
                noOptionsMessage={() => 'No values available'}
                options={props.options}
                placeholder={props.placeholder}
                isSearchable={props.searchable}
                styles={customStyles}
                onChange={props.onChange}
            />
            {props.error && <Error>{props.error}</Error>}
        </StyledInputContainer>
    );
};
