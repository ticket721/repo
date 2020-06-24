import React from 'react';
import styled from 'styled-components';
import { PreviewInfos, TicketHeader } from '@frontend/flib-react/lib/components';

import { Date } from '../../../types/UserEvents';
import { formatDateForDisplay } from '../../../utils/functions';

interface Props {
  category: Date | undefined;
}

const Preview = ({ category }: Props) => {
  const startDate = category && formatDateForDisplay(category.startDate, 'day');
  const endDate = category && formatDateForDisplay(category.endDate, 'day');
  const startTime = category && formatDateForDisplay(category.startDate, 'time');
  const endTime = category && formatDateForDisplay(category.endDate, 'time');

  return (
    <>
      <Title>User preview</Title>
      <TicketContainer>
        <Ticket>
          <TicketHeader ticket={{
            // @ts-ignore
            category,
            image: category.avatar,
            startDate,
            endDate
          }}
          />
          <Overlap>
            { /* tslint:disable */}
            <PreviewInfos
              ticket={{
              ...category,
              image: category.avatar,
              mainColor: category.colors[0],
              location: category.location,
              gradients: category.colors,
              ticketType: category.categories[0].name,
              address: '',
              ticketId: '',
              startDate,
              endDate,
              startTime,
              endTime,
            }}
            />
            { /* tslint:enable */}
          </Overlap>
        </Ticket>
      </TicketContainer>
    </>
  );
};

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

export default Preview;
