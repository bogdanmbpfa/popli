import { DateTime } from 'luxon';

export default function (date: string, format: string = 'dd/MM/yyyy'): string {
  const dateTime = DateTime.fromISO(date, { zone: 'utc' });

  if (!dateTime.isValid) return '';

  return dateTime.toFormat(format);
}
