// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import EventSideMenu from "./EventSideMenu";
import { PreviewInfos, TicketHeader } from "@frontend/flib-react/lib/components";
import Pages from "./Pages";
import { formatDateForDisplay } from "../../utils/functions";
import { Events } from "../../types/UserEvents";

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (startDate: string) => void;
  name: string;
  userEvents: Events[];
}

const EventPresentation = ({ currentDate, setCurrentDate, name, userEvents }: Props) => {
  const [page, setPage] = React.useState<'general' | 'ticket' | 'dates' | 'location' | 'presentation'>();
  const category = userEvents.find((e) => e.name === name);
  const first = category.dates.find((e) => e.type === 'date');
  const startDate = first && formatDateForDisplay(first.startDate, 'day');
  const endDate = first && formatDateForDisplay(first.endDate, 'day');
  const startTime = first && formatDateForDisplay(first.startDate, 'time');
  const endTime = first && formatDateForDisplay(first.endDate, 'time');

  return (
    <>
      <EventSideMenu
        name={name}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        setPage={setPage}
        userEvents={userEvents}
      />
      <PageContainer>
        { !page && (
          <>
            <Title>User preview</Title>
            <TicketContainer>
              <Ticket>
                <TicketHeader ticket={{
                  first,
                  image: first.avatar,
                  startDate,
                  endDate
                }}
                />
                <Overlap>
                  <PreviewInfos ticket={{
                    ...first,
                    image: first.avatar,
                    mainColor: first.signature_colors[0],
                    location: first.location.location_label,
                    gradients: first.signature_colors,
                    ticketType: first.categoryName,
                    startDate,
                    endDate,
                    startTime,
                    endTime,
                  }}
                  />
                </Overlap>
              </Ticket>
            </TicketContainer>
          </>
        )}
        {
          page && <Pages page={page} userEvent={category} currentDate={currentDate}/>
        }
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: calc(100% - 280px);
  margin-left: 280px;
`;

const TicketContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

const Ticket = styled.div`
  width: 380px;
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
`;

const Overlap = styled.div`
  margin-top: -94px;
  position: relative;
  z-index: 1;
`;

const Title = styled.span`
  width: 100%;
  margin-bottom: 25px;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => props.theme.textColor};
  text-align: center;
`;

export default EventPresentation;
