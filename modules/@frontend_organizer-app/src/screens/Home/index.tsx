import React                from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { v4 } from 'uuid';
import { useTranslation } from 'react-i18next';

import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { RightEntity } from "@common/sdk/lib/@backend_nest/libs/common/src/rights/entities/Right.entity";
import { useRequest } from "@frontend/core/lib/hooks/useRequest";
import { CacheCore } from "@frontend/core/lib/cores/cache/CacheCore";
// import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { SingleImage } from "@frontend/flib-react/lib/components";
import { AppState } from "@frontend/core/src/redux/ducks";
import { useDeepEffect } from "@frontend/core/lib/hooks/useDeepEffect";

import EventPresentation from "../../components/EventPresentation";
import HomeSideMenu from "../../components/HomeSideMenu";
import { MergedAppState } from "../../index";
import { formatDateForDisplay } from "../../utils/functions";
import { Events } from "../../types/UserEvents";

import { formatEvent, formatDates, formatCategories} from "./utils";
import './locales';


const Home: React.FC = () => {
  const [ t ] = useTranslation(['home']);
  const [currentDate, setCurrentDate] = React.useState<string>();
  const [name, setName] = React.useState<string>();
  const [page, setPage] = React.useState<'general' | 'ticket' | 'dates' | 'location' | 'presentation'>();
  const [userEvents, setUserEvents] = React.useState<Events[]>([]);

  const rights = useSelector((state: MergedAppState) => state.cache.items[CacheCore.key('rights.search', [
    state.auth.token.value, {}
  ])]);
  const groupIDs = rights ? rights.data.rights.filter((r: RightEntity) => r.entity_type === 'event').map((e: any) => e.entity_value) : undefined;
  const [uuid] = React.useState(v4());
  const [uuid2] = React.useState(v4());
  const [uuid3] = React.useState(v4());
  const token = useSelector((state: AppState): string => state.auth.token.value);
  const { response: events } = useRequest<EventsSearchResponseDto>(
    {
      method: 'events.search',
      args: [
        token,
        {
          group_id: {
            $in: groupIDs,
          }
        },
      ],
      refreshRate: 50,
    },
    uuid
  );
  const { response: dates } = useRequest<DatesSearchResponseDto>(
    {
      method: 'dates.search',
      args: [
        token,
        {
          group_id: {
            $in: groupIDs,
          }
        },
      ],
      refreshRate: 50,
    },
    uuid2
  );
  const { response: categories } = useRequest<CategoriesSearchResponseDto>(
    {
      method: 'categories.search',
      args: [
        token,
        {
          group_id: {
            $in: groupIDs,
          }
        },
      ],
      refreshRate: 50,
    },
    uuid3
  );

  useDeepEffect(() => {
    console.log('deep effect');
    if (groupIDs && !events.loading && !events.error) {
      setUserEvents(formatEvent(events.data.events));
    }
    if (groupIDs && !dates.loading && !dates.error) {
      setUserEvents(formatDates(dates.data.dates, userEvents));
    }
    if (groupIDs && !categories.loading && !categories.error) {
      setUserEvents(formatCategories(categories.data.categories, userEvents));
    }
    // eslint-disable-next-line
  }, [events, dates, groupIDs, categories]);

  if (events.loading || dates.loading || categories.loading) {
    return (
      <Container>
        {t('loading_label')}
      </Container>
    );
  }
  if (!events.loading && !dates.loading && !categories.loading && userEvents.length === 0) {
    return (
      <Container>
        {t('no_result_label')}
      </Container>
    );
  }
//  console.log('UserEvents : ', userEvents);
  return (
    <>
      {currentDate &&
        <EventPresentation
          setPage={setPage}
          page={page}
          name={name}
          currentDate={currentDate}
          setName={setName}
          setCurrentDate={setCurrentDate}
          userEvents={userEvents}
        />
      }
      {!currentDate &&
        <HomeSideMenu
            setName={setName}
            setCurrentDate={setCurrentDate}
            name={name}
            userEvents={userEvents}
        />
      }
      <Container>
        {!currentDate && userEvents.map((event, i) => {
          const first = event.dates[0];

          return (
            <div key={`home-${event.group_id}-${i}`}
               className='card'
               onClick={() => {
                setName(event.name);
                setCurrentDate(formatDateForDisplay(first.startDate));
              }}
            >
              <SingleImage
                src={first.avatar}
                id={`presentation-card-${event.group_id}-${i}`}
                title={event.name}
                price={parseFloat("12")}
                text={formatDateForDisplay(first.startDate)}
              />
            </div>
          );
        })}
      </Container>
    </>
  )
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: calc(100% - 280px);
  margin-left: 280px;

  .card {
    width: 100%;
    display: flex;
    @media (min-width: 1024px) {
      width: 45%;
    }
    cursor: pointer;
    margin: 0 15px;
  }
`;

export default Home;
