import { afterEach, expect, it, vi } from "vitest";
import { createSessionWriter, fresh, KEY, loadSave } from "../src/progression";

afterEach(() => vi.unstubAllGlobals());

function mockStorage() {
  const data = new Map<string, string>();
  const setItem = vi.fn((key: string, value: string) => data.set(key, value));
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem,
  });
  return { data, setItem };
}

it("saves new sessions and subsequent progress changes", () => {
  mockStorage();
  const write = createSessionWriter();
  expect(write(fresh())).toBe(true);
  expect(write({ ...fresh(), phase: "coding" })).toBe(true);
  expect(loadSave().phase).toBe("coding");
});

it("does not restore deleted progress on checkpoints, changes, or page exit", () => {
  const { data, setItem } = mockStorage();
  const write = createSessionWriter();
  write({ ...fresh(), phase: "coding" });
  data.delete(KEY);
  for (let i = 0; i < 3; i++) expect(write(fresh())).toBe(false);
  expect(data.has(KEY)).toBe(false);
  expect(setItem).toHaveBeenCalledTimes(1);
  // A new page session can create a fresh save again.
  expect(createSessionWriter()(fresh())).toBe(true);
  expect(loadSave().phase).toBe(fresh().phase);
  // The old session must not overwrite the new session's save.
  expect(write({ ...fresh(), phase: "coding" })).toBe(false);
  expect(loadSave().phase).toBe(fresh().phase);
});

it("handles unavailable storage and retries after a failed write", () => {
  const { setItem } = mockStorage();
  setItem.mockImplementationOnce(() => {
    throw new Error("quota exceeded");
  });
  const write = createSessionWriter();
  expect(write(fresh())).toBe(false);
  expect(write(fresh())).toBe(true);
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("blocked");
    },
  });
  expect(write(fresh())).toBe(false);
});
