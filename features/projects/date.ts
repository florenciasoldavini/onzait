const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseProjectDate(value: string | null | undefined) {
  const match = dateOnlyPattern.exec(value?.trim() ?? "");

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatProjectDate(
  value: string | null | undefined,
  {
    fallback = "TBD",
    locale
  }: { fallback?: string; locale?: Intl.LocalesArgument } = {}
) {
  const date = parseProjectDate(value);

  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
