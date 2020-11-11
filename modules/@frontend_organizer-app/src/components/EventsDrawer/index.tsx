import { AnimatePresence, motion, Spring } from 'framer';
import React from 'react';
import { useLocation } from 'react-router';
import styled from 'styled-components';
import { BreadCrumb } from './BreadCrumb';
import { DashboardMenu } from './DashboardMenu';
import { DateMenu } from './DateMenu';
import { EventMenu } from './EventMenu';
import './locales';

const buildMenu = (path: string): JSX.Element => {
    const transition: Spring = {
        type: 'spring',
        stiffness: 200,
        damping: 26,
    };

    if (path.includes('/date') && !path.endsWith('/date')) {
        return <motion.div
        key={'date'}
        transition={transition}
        initial={{ x: 350 }}
        animate={{ x: 0 }}
        exit={{ x: -350, position: 'absolute' }}>
            <DateMenu/>
        </motion.div>;
    }

    if (path.includes('/event')) {
        return <motion.div
        key={'event'}
        transition={transition}
        initial={{ x: 350 }}
        animate={{ x: 0 }}
        exit={{ x: -350, position: 'absolute' }}>
            <EventMenu/>
        </motion.div>;
    }

    return <motion.div
    key={'dashboard'}
    transition={transition}
    initial={{ x: 350 }}
    animate={{ x: 0 }}
    exit={{ x: -350, position: 'absolute' }}>
        <DashboardMenu/>
    </motion.div>;
}

export const EventsDrawer: React.FC = () => {
    const location = useLocation();

    return <EventDrawerContainer>
        <BreadCrumb/>
        <AnimatePresence initial={false}>
            {
                buildMenu(location.pathname)
            }
        </AnimatePresence>
    </EventDrawerContainer>
}

const EventDrawerContainer = styled.div`
    position: fixed;
    width: 350px;
    height: calc(100vh - 65px);
    background-color: ${props => props.theme.darkerBg};
    overflow: scroll;
`;
