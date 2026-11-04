const {
  formatDubaiDateTime,
  getDubaiDateInputValue,
  parseDateAsUtc,
  parseTimestampAsUtc,
} = require("./dateTime");

describe("UTC database timestamps and Dubai formatting", () => {
  test("parses timezone-naive PostgreSQL timestamps as UTC", () => {
    expect(parseTimestampAsUtc("2026-11-04 20:30:00.123").toISOString()).toBe(
      "2026-11-04T20:30:00.123Z",
    );
  });

  test("parses PostgreSQL dates as UTC midnight without changing their JSON shape", () => {
    expect(parseDateAsUtc("2026-11-04").toISOString()).toBe(
      "2026-11-04T00:00:00.000Z",
    );
  });

  test("formats timestamps in Dubai local time", () => {
    expect(formatDubaiDateTime(new Date("2026-11-04T20:30:00.000Z"))).toBe(
      "05 Nov 2026, 00:30",
    );
  });

  test("gets the local Dubai calendar date", () => {
    expect(getDubaiDateInputValue(new Date("2026-11-04T20:30:00.000Z"))).toBe(
      "2026-11-05",
    );
  });
});
