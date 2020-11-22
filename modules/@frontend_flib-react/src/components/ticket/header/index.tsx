import * as React from 'react';
import styled from '../../../config/styled';
import { motion } from 'framer-motion';

export interface TicketHeaderProps extends React.ComponentProps<any> {
    datesCount: number;
    datesIdx: number;
    mainColors: string[];
    ticketQuantity?: number;
    cover: string;
    fullWidth?: boolean;
    className?: string;
}

const Header = styled(motion.header)<TicketHeaderProps>`
    position: relative;
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

const Content = styled(motion.div)<{ cover: string }>`
    width: 100%;
    height: 0;
    padding-top: 66.25%;
    background: url(${(props) => props.cover});
    background-position: center;
    background-size: cover;
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
        <Header layoutId={'ticket-header'} fullWidth={props.fullWidth} className={props.className}>
            <Content layoutId={'ticket-cover'} cover={props.cover} />
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
