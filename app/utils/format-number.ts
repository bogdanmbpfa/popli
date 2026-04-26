export default function (value: number): string {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    roundingMode: 'floor',
  }).format(value);
}
