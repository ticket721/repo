import React, { useState } from 'react';
import { GuestInfos }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsGuestlistResponse.dto';
import styled              from 'styled-components';
import { useTranslation }  from 'react-i18next';
import './locales';
import { StaffAppState }   from '../../redux';
import { useSelector }     from 'react-redux';
import { GuestItem }       from './GuestItem';

interface GuestListProps {
    guests: GuestInfos[];
    ticketsCount: number;
}

export const GuestList: React.FC<GuestListProps> = ({ guests, ticketsCount }: GuestListProps) => {
    const [ t ] = useTranslation('guestlist');
    const [
        filteredCategories,
        checkedGuests
    ] = useSelector((state: StaffAppState) => [
        state.currentEvent.filteredCategories,
        state.currentEvent.checkedGuests
            .filter(guest =>
                state.currentEvent.filteredCategories
                    .findIndex(category => category.id === guest.category) !== -1),
    ]);

    const [ activeTab, setActiveTab ] = useState<string>('pending');
    return <>
        <Header>
            <Title>{t('attendees_title')}</Title>
            <TabsBtn>
                <div
                    className={activeTab === 'pending' ? 'active' : null}
                    onClick={() => setActiveTab('pending')}>
                    {t('pending_label')} ({ticketsCount - checkedGuests.length})
                </div>
                <div
                    className={activeTab === 'checked' ? 'active' : null}
                    onClick={() => checkedGuests.length > 0 ? setActiveTab('checked') : null}>
                    {t('checked_label')} ({checkedGuests.length})
                </div>
            </TabsBtn>
        </Header>
        {
            activeTab === 'pending' ?
                guests
                    .filter(guest =>
                        checkedGuests
                                .findIndex(checkedGuest => guest.ticket === checkedGuest.ticketId) === -1)
                    .map(guest => (
                        <GuestItem
                            key={guest.ticket}
                            email={guest.email}
                            name={guest.username}
                            category={
                                filteredCategories.find(category => category.id === guest.category).name
                            }
                        />
                    )) :
                checkedGuests
                    .map(guest => (
                    <GuestItem
                        key={guest.ticketId}
                        email={guest.email}
                        name={guest.name}
                        category={
                            filteredCategories.find(category => category.id === guest.category).name
                        }
                        checkedDate={new Date(guest.checkedTimestamp)}
                    />
                ))
        }
    </>
};

const Header = styled.div`
    position: sticky;
    top: 0;
    margin-top: calc(2 * ${props => props.theme.biggerSpacing});
    padding: ${props => props.theme.regularSpacing} 0;
    background: linear-gradient(91.44deg,#0a0812 0.31%,#120f1a 99.41%);
`;

const Title = styled.h2`
    margin: 0 ${props => props.theme.biggerSpacing} ${props => props.theme.regularSpacing};
    font-size: 24px;
    line-height: 30px;
    font-weight: 600;
`;

const TabsBtn = styled.div`
    display: flex;
    margin: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing} 0;

    & > div {
        padding: 12px ${props => props.theme.regularSpacing};
        transition: background-color 300ms, color 300ms;
        color: ${props => props.theme.textColorDark};
        border-radius: ${props => props.theme.defaultRadius};
        font-weight: 500;
        font-size: 14px;

        &.active {
            background-color: ${props => props.theme.componentColor};
            color: ${props => props.theme.textColor};
        }
    }

    & > div:first-child {
        margin-right: ${props => props.theme.smallSpacing};
    }
`;
