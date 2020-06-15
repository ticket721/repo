// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import EventSideMenu from "./EventSideMenu";
import { PreviewInfos, TicketHeader } from "@frontend/flib-react/lib/components";
import Pages from "./Pages";
import { dates } from './fakeData';

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (startDate: string) => void;
  name: string;
}

const EventPresentation = ({ currentDate, setCurrentDate, name }: Props) => {
  const category = dates.find((e) => e[0].name === name);
  const [page, setPage] = React.useState<string>();

  return (
    <>
      <EventSideMenu name={name} currentDate={currentDate} setCurrentDate={setCurrentDate} setPage={setPage}/>
      <PageContainer>
        { !page && (
          <>
            <Title>User preview</Title>
            <TicketContainer>
              <Ticket>
                <TicketHeader ticket={{
                    ...category[0],
                    startDate: category[0].startDate.toDateString(),
                    endDate: category[0].endDate.toDateString()
                  }}
                />
                <Overlap>
                  <PreviewInfos ticket={{
                      ...category[0],
                      startDate: category[0].startDate.toDateString(),
                      endDate: category[0].endDate.toDateString()
                    }}
                  />
                </Overlap>
              </Ticket>
            </TicketContainer>
          </>
        )}
        {
          page && <Pages page={page}/>
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
