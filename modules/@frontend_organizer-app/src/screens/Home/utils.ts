import { Events } from "../../types/UserEvents";

const formatEvent = (events: any, userEvents: Events[]) => {
  const newEvents = events.map((e: any) => {
    const sub = e.dates.map((d: string) => ({id: d, name: e.name}));
    return ({ id: e.id, dates: [...sub], name: e.name });
  });
  newEvents.forEach((e: any) => {
    if (userEvents.find((c) => c.id === e.id) === undefined) {
      userEvents.push(e);
    }
  });
};

const formatDates = (dates: any, userEvents: Events[]): any => {
  let tmp = [...userEvents];
  const origin =
    `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static/`;

  const newEvents = userEvents.map((e) => {
    const newDates = dates.map((d: any) => {
      if (e.id !== d.parent_id) {
        return undefined;
      }
      const date = e.dates.find(c => c.id === d.id);
      return ({
        ...date,
        ...d.metadata,
        avatar: `${origin}${d.metadata.avatar}`,
        id: d.id,
        categories: d.categories,
        startDate: d.timestamps.event_begin,
        endDate: d.timestamps.event_end,
        location: d.location
      });
    });
    return ({ ...e, dates: newDates.filter((n: any) => n !== undefined) });
  });
  newEvents.forEach((e) => {
    if (!userEvents.find((c) => c.id === e.id)) {
      tmp.push(e);
    } else {
      const i = userEvents.findIndex((c) => c.id === e.id);
      tmp[i] = e;
    }
  });
  return tmp;
}

const formatCategories = (categories: any, userEvents: Events[]) => {
  const tmp = [...userEvents];

  const newEvents = userEvents.map((e, idx) => {
    const newDates = categories.map((d: any) => {
      if (e.dates.find(c => c.id === d.parent_id) || d.parent_id === e.id) {
        const category = userEvents[idx].dates.find(c => (c.id === d.parent_id));
        return ({
          ...category,
          id: category ? category.id : d.id,
          price: d.prices[0].value,
          salesStart: d.sale_begin,
          salesEnd: d.sale_end,
          resalesStart: d.resale_begin,
          resalesEnd: d.resale_end,
          seats: d.seats,
          categoryName: d.display_name,
          type: d.parent_type,
        });
      } else {
        return undefined;
      }
    });
    return ({...e, dates: newDates.filter((d: any) => d !== undefined) });
  });
  newEvents.forEach((e, idx) => {
    e.dates.forEach((d: any, i: number) => {
      const index = userEvents[idx].dates.findIndex((c) => c.id === d.id);
      if (index >= 0) {
        tmp[idx].dates[i] = d;
      } else {
        tmp[idx].dates.push(newEvents[idx].dates[i]);
      }

    });
  });
  return tmp;
}

export { formatEvent, formatDates, formatCategories };
