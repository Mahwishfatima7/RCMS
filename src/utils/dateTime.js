const DUBAI_TIME_ZONE = "Asia/Dubai";

const parseTimestampAsUtc = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/.exec(
    value,
  );
  if (!match) {
    return value;
  }

  const [, year, month, day, hour, minute, second, fraction = ""] = match;
  const milliseconds = Number(`0.${fraction}`) * 1000;
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      milliseconds,
    ),
  );
};

const parseDateAsUtc = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }
  const [, year, month, day] = match;
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );
};

const parseTimestamp = (value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }

  const date = parseTimestampAsUtc(value);
  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDubaiDateTime = (value) => {
  const date = parseTimestamp(value);
  if (!date) {
    return value == null ? "" : String(value);
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
};

const getDubaiDateInputValue = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DUBAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

module.exports = {
  parseTimestampAsUtc,
  parseDateAsUtc,
  formatDubaiDateTime,
  getDubaiDateInputValue,
};
