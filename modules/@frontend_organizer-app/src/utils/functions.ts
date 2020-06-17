export const formatDateForDisplay = (dateToFormat: Date | string, format: 'all' | 'day' | 'time' = 'all'): string => {
  const getMinutes = (d: Date): string => (d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`);

  let date: Date;

  if (typeof dateToFormat === typeof "string") {
    date = new Date(dateToFormat)
  } else {
    // @ts-ignore
    date = dateToFormat;
  }
  if (format === 'all') {
    return `${date.toDateString()} - ${date.getHours()}:${getMinutes(date)}`;

  } else if (format === 'day') {
    return date.toDateString();

  } else {
    return `${date.getHours()}:${getMinutes(date)}`;
  }
};
