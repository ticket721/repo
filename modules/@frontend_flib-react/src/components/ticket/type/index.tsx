import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface TicketTypeProps extends React.ComponentProps<any> {
    gradient: string[];
    description: JSX.Element;
    selected?: boolean;
    soldOutLabel: string;
    price: string;
    title: string;
    ticketsLeft: number;
    ticketsLeftLabel: string;
    onClick?: () => void;
}

const Container = styled.article<TicketTypeProps>`
    background-color: ${(props) => (props.selected ? props.theme.darkerBg : props.theme.darkBg)};
    border-bottom: 2px solid #000;
    font-weight: 500;
    padding: ${(props) => props.theme.biggerSpacing};
    position: relative;
    transition: background-color 300ms ease;

    &:last-of-type {
        border: none;
    }

    &:before {
        background: linear-gradient(260deg, ${(props) => props.gradient.join(', ')});
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

    h4 {
        font-size: 15px;
        margin: ${(props) => props.theme.regularSpacing} 0 ${(props) => props.theme.smallSpacing};

        & + span {
            color: ${(props) => props.theme.textColorDarker};
        }
    }

    p {
        color: ${(props) => props.theme.textColorDark};
        margin-top: ${(props) => props.theme.regularSpacing};
    }
`;

const TicketCount = styled.span<TicketTypeProps>`
    align-items: center;
    color: ${(props) => (props.ticketsLeft < 1 ? props.theme.textColorDark : props.theme.textColor)};
    display: inline-flex;
    font-size: 14px;
    font-weight: 500;

    svg {
        margin-right: ${(props) => props.theme.smallSpacing};
        position: relative;
        top: -2px;
    }
`;

const TicketIcon = styled(Icon)`
    margin-right: ${(props) => props.theme.regularSpacing};
`;

export const TicketType: React.FunctionComponent<TicketTypeProps> = (props: TicketTypeProps): JSX.Element => {
    return (
        <Container selected={props.selected} gradient={props.gradient} onClick={props.onClick}>
            <div className={'row aic jcsb'}>
                <h3>{props.title}</h3>
                <TicketCount ticketsLeft={props.ticketsLeft}>
                    <TicketIcon icon={'ticket'} size={'20px'} color={props.gradient[0]} />
                    {props.ticketsLeft < 1 ? props.soldOutLabel : `${props.ticketsLeft} ${props.ticketsLeftLabel}`}
                </TicketCount>
            </div>
            <h4>{props.price}</h4>

            {props.description}
        </Container>
    );
};

TicketType.defaultProps = {
    color: '#079CF0',
    gradient: ['#079CF0', '#2143AB'],
};

export default TicketType;
