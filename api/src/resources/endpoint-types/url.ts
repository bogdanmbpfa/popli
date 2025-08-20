import { Static, Type } from '@sinclair/typebox';

export const UrlShortUrlCreate = Type.Object({
  url: Type.String({ format: 'uri' }),
  alias: Type.Optional(Type.String({ minLength: 3, maxLength: 255 })),
  title: Type.String({ minLength: 3, maxLength: 255 }),
});

export const UrlShortUrl = Type.Object({
  id: Type.String({ format: 'uuid' }),
  originalUrl: Type.String({ format: 'uri' }),
  shortCodeUrl: Type.String({ format: 'uri' }),
  alias: Type.Union([
    Type.String({ minLength: 3, maxLength: 255 }),
    Type.Null(),
  ]),
  aliasUrl: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),
  title: Type.String({ minLength: 3, maxLength: 255 }),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  todayClicks: Type.Number(),
  dailyUniqueVisitors: Type.Array(
    Type.Object({
      date: Type.String({ format: 'date' }),
      visitors: Type.Number(),
    }),
  ),
  todayUniqueVisitors: Type.Number(),
  totalClicks: Type.Number(),
  totalUniqueVisitors: Type.Number(),
});

export const UrlShortUrlCode = Type.Object({
  shortCode: Type.String({ minLength: 3, maxLength: 255 }),
});

export const UrlShortUrlCodeResponse = Type.Object({
  url: Type.String({ format: 'uri' }),
});

export const UrlIpApiResponse = Type.Object({
  ipVersion: Type.Number(),
  ipAddress: Type.String(),
  latitude: Type.Number(),
  longitude: Type.Number(),
  countryName: Type.String(),
  countryCode: Type.String(),
  capital: Type.String(),
  phoneCodes: Type.Array(Type.Number()),
  timeZones: Type.Array(Type.String()),
  zipCode: Type.String(),
  cityName: Type.String(),
  regionName: Type.String(),
  continent: Type.String(),
  continentCode: Type.String(),
  currencies: Type.Array(Type.String()),
  languages: Type.Array(Type.String()),
  asn: Type.String(),
  asnOrganization: Type.String(),
  isProxy: Type.Boolean(),
});

export const UrlShortUrlId = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export const UrlShortUrlUpdate = Type.Object({
  id: Type.String({ format: 'uuid' }),
  url: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),
  alias: Type.Union([
    Type.String({ minLength: 3, maxLength: 255 }),
    Type.Null(),
  ]),
  title: Type.Union([
    Type.String({ minLength: 3, maxLength: 255 }),
    Type.Null(),
  ]),
});

export const UrlShortUrlDailyClicks = Type.Array(
  Type.Object({
    date: Type.String({ format: 'date' }),
    clicks: Type.Number(),
  }),
);

export const UrlShortUrlCountryClicks = Type.Object({
  country: Type.String(),
  countryCode: Type.String(),
  clicks: Type.Number(),
});

export type UrlShortUrlCreateType = Static<typeof UrlShortUrlCreate>;
export type UrlShortUrlType = Static<typeof UrlShortUrl>;
export type UrlShortUrlCodeType = Static<typeof UrlShortUrlCode>;
export type UrlShortUrlCodeResponseType = Static<
  typeof UrlShortUrlCodeResponse
>;
export type UrlIpApiResponseType = Static<typeof UrlIpApiResponse>;
export type UrlShortUrlIdType = Static<typeof UrlShortUrlId>;
export type UrlShortUrlUpdateType = Static<typeof UrlShortUrlUpdate>;
export type UrlShortUrlDailyClicksType = Static<typeof UrlShortUrlDailyClicks>;
export type UrlShortUrlCountryClicksType = Static<
  typeof UrlShortUrlCountryClicks
>;
