import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import { localRepo } from "../src/storage/localRepo";
import type { PersistedState } from "../src/types/models";

beforeEach(() => localStorage.clear());

const sessionArb = fc.record({
  completedTaskIds: fc.array(fc.string(), { maxLength: 8 }),
  appliedIds: fc.array(fc.integer({ min: 1, max: 9999 }), { maxLength: 8 }),
  savedIds: fc.array(fc.integer({ min: 1, max: 9999 }), { maxLength: 8 }),
  dismissedAlertIds: fc.array(fc.string(), { maxLength: 8 }),
  lastActiveAt: fc.option(fc.date().map((d) => d.toISOString()), { nil: null }),
  lastCycleAt: fc.option(fc.date().map((d) => d.toISOString()), { nil: null }),
});

describe("localRepo (CINV-1 round-trip)", () => {
  it("save then load returns an equivalent PersistedState", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 12 }),
        fc.string({ maxLength: 100 }),
        sessionArb,
        (profileId, goalText, session) => {
          const state: PersistedState = { profileId, goalText, session };
          localRepo.save(state);
          const loaded = localRepo.load(profileId);
          expect(loaded).toEqual(state);
        },
      ),
    );
  });
});
