import * as React from 'react';
import styled from '../../../config/styled';

export interface TicketHeaderProps extends React.ComponentProps<any> {
    datesCount: number;
    datesIdx: number;
    mainColors: string[];
    ticketQuantity?: number;
    cover: string;
    fullWidth?: boolean;
    className?: string;
}

const TicketHeaderNumber = styled.div`
    background: ${(props) => props.theme.textColor};
    border-bottom-left-radius: ${(props) => props.theme.defaultRadius};
    color: #060814;
    font-size: 12px;
    font-weight: 500;
    padding: calc(${(props) => props.theme.regularSpacing} / 2);
    position: absolute;
    right: 0;
    top: 0;
`;
const Header = styled.header<TicketHeaderProps>`
    position: relative;
    padding-top: 62.5%;
    overflow: hidden;

    ${(props) =>
        !props.fullWidth &&
        `
    border-top-left-radius: ${props.theme.defaultRadius};
    border-top-right-radius: ${props.theme.defaultRadius};
  `}

    ${(props) =>
        props.fullWidth &&
        `
      &::before {
      background: linear-gradient(180deg, rgba(10, 11, 23, 0.7) 0%, rgba(17, 16, 24, 0) 100%);
      content: '';
      display: block;
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
  `}

  img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
    }
`;

const Content = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
`;

const CursorBackground = styled.div`
    z-index: 2;
    position: absolute;
    width: 90%;
    height: 5px;
    top: 10px;
    left: 5%;
    background-color: #00000050;
    border-radius: 2px;
`;

interface CursorElementProps {
    width: number;
    position: number;
    colorStart: string;
    colorEnd: string;
}

const CursorElement = styled.div<CursorElementProps>`
    position: absolute;
    z-index: 3;
    left: ${(props) => props.position}%;
    width: ${(props) => props.width}%;
    height: 5px;
    background-color: ${(props) => props.colorStart};
    border-radius: 2px;
    transition: left 500ms ease-in-out;
`;

const Cursor = (props: { datesCount: number; datesIdx: number; mainColors: [string, string] }) => {
    const position = Math.floor((100 / props.datesCount) * props.datesIdx);
    const width = Math.floor(100 / props.datesCount);

    return (
        <CursorBackground>
            <CursorElement
                width={width}
                position={position}
                colorStart={props.mainColors[0]}
                colorEnd={props.mainColors[1]}
            />
        </CursorBackground>
    );
};

export const TicketHeader: React.FunctionComponent<TicketHeaderProps> = (props: TicketHeaderProps): JSX.Element => {
    return (
        <Header fullWidth={props.fullWidth} className={props.className}>
            <Content>
                {!props.fullWidth && props.ticketQuantity ? (
                    <TicketHeaderNumber>x{props.ticketQuantity}</TicketHeaderNumber>
                ) : null}
                <img src={props.cover} alt={'cover'} />
            </Content>
            {props.datesCount > 1 ? (
                <Cursor
                    datesCount={props.datesCount}
                    datesIdx={props.datesIdx % props.datesCount}
                    mainColors={[props.mainColors[0], props.mainColors[1]]}
                />
            ) : null}
        </Header>
    );
};

export default TicketHeader;
