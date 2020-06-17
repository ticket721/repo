import React                from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { v4 } from 'uuid';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useRequest } from "@frontend/core/lib/hooks/useRequest";
import { CacheCore } from "@frontend/core/lib/cores/cache/CacheCore";
// import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { SingleImage } from "@frontend/flib-react/lib/components";
import { AppState } from "@frontend/core/src/redux/ducks";

import EventPresentation from "../../components/EventPresentation";
import HomeSideMenu from "../../components/HomeSideMenu";

import { MergedAppState } from "../../index";
import { formatDateForDisplay } from "../../utils/functions";
import { Events } from "../../types/UserEvents";
import { formatEvent, formatDates, formatCategories} from "./utils";

const Home: React.FC = () => {
  const [currentDate, setCurrentDate] = React.useState<string>();
  const [name, setName] = React.useState<string>();
  let userEvents: Events[] = [];

  const rights = useSelector((state: MergedAppState) => state.cache.items[CacheCore.key('rights.search', [
    state.auth.token.value, {}
  ])]);
  const event = rights ? rights.data.rights.find((r: any) => r.entity_type === 'event') : undefined;
  const date = rights ? rights.data.rights.find((r: any) => r.entity_type === 'date') : undefined;
  const category = rights ? rights.data.rights.find((r: any) => r.entity_type === 'category') : undefined;

  const [uuid] = React.useState(v4());
  const token = useSelector((state: AppState): string => state.auth.token.value);
  const { response: events, registerEntity: eventRegisterEntity } = useRequest<EventsSearchResponseDto>(
    {
      method: 'events.search',
      args: [
        token,
        {
          group_id: {
            $eq: event ? event.entity_typen: "",
          }
        },
      ],
      refreshRate: 50,
    },
    uuid
  );
  const { response: dates, registerEntity: dateRegisterEntity } = useRequest<DatesSearchResponseDto>(
    {
      method: 'dates.search',
      args: [
        token,
        {
          group_id: {
            $eq: date ? date.entity_typen: "",
          }
        },
      ],
      refreshRate: 50,
    },
    uuid
  );
  const { response: categories, registerEntity: categoryRegisterEntity } = useRequest<CategoriesSearchResponseDto>(
    {
      method: 'categories.search',
      args: [
        token,
        {
          group_id: {
            $eq: event ? event.entity_typen: "",
          }
        },
      ],
      refreshRate: 50,
    },
    uuid
  );

  if (event && !events.loading && !events.error) {
    formatEvent(events.data.events, userEvents);
  }
  if (date && !dates.loading && !dates.error) {
    userEvents = formatDates(dates.data.dates, userEvents);
  }
  if (category && !categories.loading && !categories.error) {
    userEvents = formatCategories(categories.data.categories, userEvents);
  }

  React.useEffect(() => {
    if (event && !events.data && events.loading) {
      eventRegisterEntity(uuid, 50);
    }
    if (date && !dates.data && dates.loading) {
      dateRegisterEntity(uuid, 50);
    }
    if (category && !categories.data && categories.loading) {
      categoryRegisterEntity(uuid, 50);
    }
  // eslint-disable-next-line
  }, [event, events, date, dates, category, categories]);

  if (events.loading || dates.loading || categories.loading) {
    return (
      <Container>
        Loading...
      </Container>
    );
  }
  if (!events.loading && !dates.loading && !categories.loading && userEvents.length === 0) {
    return (
      <Container>
        You don't have any event
      </Container>
    );
  }
  return (
    <>
      {currentDate &&
        <EventPresentation
          name={name}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          userEvents={userEvents}
        />
      }
      {!currentDate &&
        <HomeSideMenu
            setName={setName}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            name={name}
            userEvents={userEvents}
        />
      }
      <Container>
        {!currentDate && userEvents.map((event, i) => {
          const first = event.dates.find(d => d.type === 'date');

          return (
            <div key={`home-${event.id}-${i}`} className='card' onClick={() => setName(event.name)}>
              <SingleImage
                src={first.avatar}
                id={`presentation-card-${event.id}-${i}`}
                title={event.name}
                price={parseFloat(first.price)}
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
