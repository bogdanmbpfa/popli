import type { H3Event } from 'h3';

export default function getClientIp(
  event: H3Event<EventHandlerRequest>,
): string {
  const xff = getRequestHeader(event, 'x-forwarded-for');

  if (xff) return xff.split(',')[0]!.trim();

  return getRequestIP(event, { xForwardedFor: true }) || '';
}
