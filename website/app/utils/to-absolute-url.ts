export default function (origin: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http')) return pathOrUrl;

  const base = origin.replace(/\/$/, '');
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;

  return `${base}${path}`;
}
