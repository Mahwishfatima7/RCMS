jest.mock("../config/database", () => ({
  getOne: jest.fn(),
  getAll: jest.fn(),
  updateOne: jest.fn(),
}));

const { getOne } = require("../config/database");
const slaService = require("./slaService");

describe("priority-based SLA calculations", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-11-04T11:00:00.000Z"));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test.each([
    ["low", 72],
    ["medium", 48],
    ["high", 24],
    ["critical", 8],
  ])("uses the configured %s priority duration", async (priority, duration) => {
    expect(await slaService.getSLADuration(priority)).toBe(duration);

    const deadline = await slaService.calculateSLADeadline(
      new Date("2026-11-04T10:00:00.000Z"),
      priority,
    );
    expect(deadline.getTime()).toBe(
      new Date("2026-11-04T10:00:00.000Z").getTime() +
        duration * 60 * 60 * 1000,
    );
    expect(getOne).not.toHaveBeenCalled();
  });

  test("freezes Replaced complaints at their replacement timestamp", async () => {
    const summary = await slaService.getSLASummary({
      id: 1,
      ticket_no: "RCMS-000001",
      status: "Replaced",
      priority: "critical",
      created_at: new Date("2026-11-04T10:00:00.000Z"),
      updated_at: new Date("2026-11-04T11:00:00.000Z"),
      sla_deadline: new Date("2026-11-04T12:00:00.000Z"),
      sla_duration: 2,
      sla_stopped_at: null,
    });

    jest.setSystemTime(new Date("2026-11-04T17:45:00.000Z"));
    const laterSummary = await slaService.getSLASummary({
      id: 1,
      ticket_no: "RCMS-000001",
      status: "Replaced",
      priority: "critical",
      created_at: new Date("2026-11-04T10:00:00.000Z"),
      updated_at: new Date("2026-11-04T11:00:00.000Z"),
      sla_deadline: new Date("2026-11-04T12:00:00.000Z"),
      sla_duration: 2,
      sla_stopped_at: null,
    });

    expect(summary.slaDuration).toBe(8);
    expect(summary.slaDeadline).toBe("2026-11-04T18:00:00.000Z");
    expect(summary.timeRemaining).toBe(7);
    expect(summary.slaStoppedAt).toEqual(new Date("2026-11-04T11:00:00.000Z"));
    expect(laterSummary.timeRemaining).toBe(summary.timeRemaining);
    expect(laterSummary.slaStatus).toBe("Within SLA");
  });

  test("uses the existing 80 percent At Risk threshold", async () => {
    jest.setSystemTime(new Date("2026-11-04T17:30:00.000Z"));
    const deadline = slaService.getSLADeadline(
      new Date("2026-11-04T10:00:00.000Z"),
      "critical",
    );

    expect(await slaService.determineSLAStatus(deadline, null, "critical")).toBe(
      "At Risk",
    );
  });
});
