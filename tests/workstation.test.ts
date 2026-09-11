import { afterEach, describe, expect, it, vi } from "vitest";
import { createWorkstationId } from "../src/game/workstation";
import { decode, fresh, loadSave, persist } from "../src/progression";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("workstation assignments", () => {
  it("randomizes both the letter and number within the sign's format", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0);
    expect(createWorkstationId()).toBe("A–001");
    vi.mocked(Math.random).mockReturnValue(0.999999);
    expect(createWorkstationId()).toBe("Z–999");
  });

  it("restores the same assignment from browser storage on return visits", () => {
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const save = { ...fresh(), workstationId: createWorkstationId() };
    expect(persist(save)).toBe(true);
    expect(loadSave().workstationId).toBe(save.workstationId);
    expect(persist({ ...loadSave(), phase: "coding" })).toBe(true);
    expect(loadSave().workstationId).toBe(save.workstationId);
  });

  it("allows older saves and invalid assignments to receive an assignment", () => {
    const { workstationId, ...legacy } = fresh();
    expect(decode(JSON.stringify(legacy)).workstationId).toBeNull();
    for (const invalid of [null, {}, 42, "H–000", "h–042", "H–42", "H–1000"]) {
      expect(
        decode(JSON.stringify({ ...legacy, workstationId: invalid }))
          .workstationId,
      ).toBeNull();
    }
    expect(
      decode(JSON.stringify({ ...legacy, workstationId: "H–042" }))
        .workstationId,
    ).toBe("H–042");
  });
});
