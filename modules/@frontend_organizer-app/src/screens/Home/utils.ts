import { Events } from '../../types/UserEvents';

const formatEvent = (events: any, dates: any): Events[] => {
  const formatEvents =  events?.map((e: any) => {
    return ({ name: e.name, group_id: e.group_id });
  });
  return formatDates(dates, formatEvents);
};

const formatDates = (dates: any, userEvents: Events[]): Events[] => {
  const origin =
    `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static/`;

  const tmp = userEvents?.map((e) => {
    const newDates = dates?.filter((d: any) => e.group_id === d.group_id)?.map((d: any) => ({
        name: d.metadata.name,
        colors: d.metadata.signature_colors,
        avatar: `${origin}${d.metadata.avatar}`,
        id: d.id,
        startDate: d.timestamps.event_begin,
        endDate: d.timestamps.event_end,
        location: d.location.location_label,
      }));
    return ({ ...e, dates: newDates });
  });
  return tmp;
}

const formatCategories = (categories: any, userEvents: Events[]): Events[] => {
  const tmp = userEvents.map(e => {
    const filteredCategories = categories?.filter((c: any) => c.group_id === e.group_id);
    const newCategories = filteredCategories?.filter((c: any) => c.parent_type === 'event')?.map((category: any) => ({
      id: category.id,
      price: category.prices,
      name: category.display_name,
    }));
    const newDates = e?.dates?.map(date => ({
      ...date,
      categories: filteredCategories?.filter((c: any) => c.parent_type === 'date')?.map((category: any) => ({
        id: category.id,
        prices: category.prices,
        name: category.display_name,
      }))
    }));
    return {...e, categories: newCategories, dates: newDates};
  });
  return (tmp);
};

export { formatEvent, formatDates, formatCategories };
