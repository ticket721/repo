import * as React from 'react';
import styled from '../../../config/styled';
import Select from '../../inputs/select';
import Icon from '../../icon';

interface Option {
    label: string;
    value: any;
}

export interface TicketQtyProps extends React.ComponentProps<any> {
    color?: string;
    fees: string;
    gradient?: string[];
    selected?: boolean;
    price: string;
    title?: string;
    ticketsLeft: number;
    typeName: string;
    options: Option[];
    onChange: (opt: Option) => void;
    onCancel?: () => void;
    initialOption: Option;
}

const Container = styled.article<TicketQtyProps>`
    background-color: ${(props) => props.theme.darkerBg};
    border-bottom: 2px solid #120f1a;
    font-size: 14px;
    font-weight: 500;
    padding: ${(props) => props.theme.biggerSpacing};
    position: relative;
    transition: background-color 300ms ease;

    &:last-of-type {
        border: none;
    }

    &:before {
        background: linear-gradient(260deg, ${(props) => props.gradient?.join(', ')});
        content: '';
        display: block;
        height: 100%;
        left: 0;
        opacity: ${(props) => (props.selected ? 1 : 0)};
        position: absolute;
        top: 0;
        transition: opacity 300ms ease;
        width: 2px;
    }

    h3 {
        position: relative;
        top: 4px;
    }

    h4 {
        font-size: 15px;
        margin: 4px 0 ${(props) => props.theme.smallSpacing};

        &.uppercase {
            color: ${(props) => props.theme.textColorDarker};
            margin: 0 0 ${(props) => props.theme.regularSpacing};
        }

        & + span {
            color: ${(props) => props.theme.textColorDarker};
        }
    }

    p {
        color: ${(props) => props.theme.textColorDark};
        margin-top: ${(props) => props.theme.regularSpacing};
    }
`;

const CancelIconButton = styled(Icon)`
    padding: 9px;
    color: ${(props) => props.theme.errorColor.hex} !important;
    background-color: ${(props) => props.theme.componentColor};
    margin-left: ${(props) => props.theme.regularSpacing};
    border-radius: ${(props) => props.theme.defaultRadius};
`;

export const TicketQty: React.FunctionComponent<TicketQtyProps> = (props: TicketQtyProps): JSX.Element => {
    return (
        <Container selected={props.selected} gradient={props.gradient}>
            {props.title && <h4 className={'uppercase'}>{props.title}</h4>}
            <div className={'row jcsb'}>
                <h3>{props.typeName}</h3>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Select
                        defaultValue={props.initialOption}
                        options={props.options}
                        menu
                        searchable={false}
                        onChange={props.onChange}
                    />
                    {props.onCancel ? <CancelIconButton icon={'close'} size={'14px'} onClick={props.onCancel} /> : null}
                </div>
            </div>
            <h4>{props.price}</h4>
            <span>{props.fees}</span>
        </Container>
    );
};

TicketQty.defaultProps = {
    color: '#079CF0',
    gradient: ['#079CF0', '#2143AB'],
};

export default TicketQty;
