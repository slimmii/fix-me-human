import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fresh, KEY } from "../src/progression";
import {
  accountKey,
  decodeSnapshot,
  ProgressStore,
  snapshot,
  type ProgressRemote,
  type ProgressSnapshot,
} from "../src/account/progress-store";

const codeSave = (code: string) => ({
  ...fresh(),
  drafts: { "board-shell": code },
});
function memory() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
function server(initial: ProgressSnapshot | null = null) {
  let value = initial;
  const remote: ProgressRemote = {
    read: vi.fn(async () => value),
    write: vi.fn(async (_userId, next) => {
      if (!value || next.modifiedAt > value.modifiedAt) value = next;
      return value!;
    }),
  };
  return {
    remote,
    get: () => value,
    set: (next: ProgressSnapshot) => {
      value = next;
    },
  };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("account progress", () => {
  it("imports timestamp-free v4 data without inventing a new gameplay time", async () => {
    const storage = memory();
    storage.setItem(KEY, JSON.stringify(codeSave("guest code")));
    const store = new ProgressStore(storage, () => 5000);
    const cloud = server();
    store.connect("alice", cloud.remote);
    await store.reconcile();
    expect(cloud.get()?.modifiedAt).toBe(0);
    expect(cloud.get()?.save.drafts["board-shell"]).toBe("guest code");
    expect(cloud.get()?.save).not.toHaveProperty("settings");
  });
  it("uses a timestamped cloud save over legacy data and keeps a backup", async () => {
    const storage = memory();
    storage.setItem(KEY, JSON.stringify(codeSave("old local")));
    const store = new ProgressStore(storage);
    store.connect("alice", server(snapshot(codeSave("cloud"), 1000)).remote);
    await store.reconcile();
    expect(store.getState().save.drafts["board-shell"]).toBe("cloud");
    expect(
      JSON.parse(storage.getItem(`${accountKey("alice")}:backup`)!).save.drafts[
        "board-shell"
      ],
    ).toBe("old local");
  });
  it("restores another computer's code and keeps device settings", async () => {
    const cloud = server();
    const first = new ProgressStore(memory(), () => 1000);
    first.update(codeSave("typed on first computer"));
    first.connect("alice", cloud.remote);
    await first.reconcile();
    const second = new ProgressStore(memory());
    second.update((save) => ({
      ...save,
      settings: { ...save.settings, mute: true, screenFontSize: 20 },
    }));
    second.connect("alice", cloud.remote);
    await second.reconcile();
    expect(second.getState().save.drafts).toEqual(first.getState().save.drafts);
    expect(second.getState().save.settings.screenFontSize).toBe(20);
    expect(second.getState().save.settings.mute).toBe(true);
  });
  it("never makes idle clocks, desk initialization, settings, or reloads newer", () => {
    const storage = memory();
    const store = new ProgressStore(storage, () => 5000);
    store.update((save) => ({
      ...save,
      settings: { ...save.settings, mute: true },
      officeClock: {
        elapsedMs: 30000,
        lastBugElapsedMs: 0,
        runningSince: null,
      },
      workstationId: "A–007",
    }));
    store.checkpoint();
    expect(store.getState().modifiedAt).toBe(0);
    store.update(codeSave("a real edit"));
    expect(store.getState().modifiedAt).toBe(5000);
    store.checkpoint();
    expect(new ProgressStore(storage, () => 9000).getState().modifiedAt).toBe(
      5000,
    );
  });
  it("keeps local edits while offline and reconciles before any upload", async () => {
    const store = new ProgressStore(memory(), () => 2000);
    const cloud = server(snapshot(codeSave("older cloud"), 1000));
    vi.mocked(cloud.remote.read).mockRejectedValueOnce(new Error("offline"));
    store.connect("alice", cloud.remote);
    store.update(codeSave("offline work"));
    await store.reconcile();
    expect(cloud.remote.write).not.toHaveBeenCalled();
    expect(store.getState().status).toBe("pending");
    await store.reconcile();
    expect(cloud.get()?.save.drafts["board-shell"]).toBe("offline work");
    expect(store.getState().status).toBe("synced");
  });
  it("preserves modification time when loading expires a saved hint", () => {
    const storage = memory();
    const store = new ProgressStore(storage, () => 5000);
    const save = codeSave("edited code");
    save.story["board-shell"] = {
      delivery: "waiting",
      current: { event: "briefing", page: 0 },
      seen: [],
      pending: [],
      aside: { event: "hint", page: 0 },
    };
    store.update(save);
    const reloaded = new ProgressStore(storage);
    expect(reloaded.getState().save.story["board-shell"].aside).toBeUndefined();
    expect(reloaded.getState().modifiedAt).toBe(5000);
  });
  it("coalesces typing into one write after a one-second debounce", async () => {
    const store = new ProgressStore(memory());
    const cloud = server();
    store.connect("alice", cloud.remote);
    await store.reconcile();
    vi.mocked(cloud.remote.write).mockClear();
    store.update(codeSave("a"));
    await vi.advanceTimersByTimeAsync(500);
    store.update(codeSave("abc"));
    await vi.advanceTimersByTimeAsync(999);
    expect(cloud.remote.write).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(cloud.remote.write).toHaveBeenCalledTimes(1);
    expect(cloud.get()?.save.drafts["board-shell"]).toBe("abc");
  });
  it("ignores object key ordering when identifying a gameplay change", () => {
    let time = 1000;
    const store = new ProgressStore(memory(), () => time);
    const save = codeSave("a draft");
    save.projects["board-shell"] = {
      activeFile: "/App.jsx",
      files: { "/App.jsx": "first file", "/styles.css": "second file" },
    };
    store.update(save);
    time = 2000;
    store.update({
      ...save,
      projects: {
        "board-shell": {
          files: { "/styles.css": "second file", "/App.jsx": "first file" },
          activeFile: "/App.jsx",
        },
      },
    });
    expect(store.getState().modifiedAt).toBe(1000);
  });
  it("keeps the editor and live hint when the cloud echoes normalized JSON", async () => {
    const store = new ProgressStore(memory(), () => 5000);
    const save = codeSave("edited code");
    save.story["board-shell"] = {
      delivery: "waiting",
      current: { event: "briefing", page: 0 },
      seen: [],
      pending: [],
      aside: { event: "hint", page: 0 },
    };
    store.update(save);
    let persisted: ProgressSnapshot | null = null;
    const remote: ProgressRemote = {
      read: async () => persisted,
      write: async (_id, value) => {
        const reordered = JSON.parse(
          JSON.stringify(value, (_key, item) =>
            item && typeof item === "object" && !Array.isArray(item)
              ? Object.fromEntries(Object.entries(item).reverse())
              : item,
          ),
        );
        persisted = decodeSnapshot(reordered)!;
        return persisted;
      },
    };
    store.connect("alice", remote);
    const restoration = store.getState().restoration;
    await store.reconcile();
    await store.reconcile();
    expect(store.getState().restoration).toBe(restoration);
    expect(store.getState().save.story["board-shell"].aside?.event).toBe(
      "hint",
    );
    expect(store.getState().status).toBe("synced");
  });
  it("favors cloud on equal timestamps and does not merge drafts", async () => {
    const store = new ProgressStore(memory(), () => 1000);
    store.update(codeSave("local"));
    const cloud = server(snapshot(codeSave("cloud"), 1000));
    store.connect("alice", cloud.remote);
    await store.reconcile();
    expect(store.getState().save.drafts).toEqual({ "board-shell": "cloud" });
    expect(cloud.remote.write).not.toHaveBeenCalled();
  });
  it("keeps newer edits made while an upload is in flight", async () => {
    const cloud = server();
    let release!: (snapshot: ProgressSnapshot) => void;
    cloud.remote.write = vi.fn(
      () =>
        new Promise<ProgressSnapshot>((resolve) => {
          release = resolve;
        }),
    );
    let time = 1000;
    const store = new ProgressStore(memory(), () => time);
    store.update(codeSave("first edit"));
    store.connect("alice", cloud.remote);
    await Promise.resolve();
    const old = store.currentSnapshot();
    time = 2000;
    store.update(codeSave("newer edit"));
    release(old);
    await store.reconcile();
    expect(store.getState().save.drafts["board-shell"]).toBe("newer edit");
    expect(store.getState().status).toBe("pending");
  });
  it("ignores old account responses after switching and restores guest progress", async () => {
    const store = new ProgressStore(memory(), () => 1000);
    store.update(codeSave("guest"));
    let release!: (value: ProgressSnapshot) => void;
    const remote = server().remote;
    remote.read = () =>
      new Promise((resolve) => {
        release = resolve;
      });
    store.connect("alice", remote);
    const pending = store.reconcile();
    store.update(codeSave("alice private"));
    store.disconnect();
    expect(store.getState().save.drafts["board-shell"]).toBe("guest");
    store.connect("bob", server().remote);
    await store.reconcile();
    release(snapshot(codeSave("alice remote private"), 9000));
    await pending;
    expect(store.getState().userId).toBe("bob");
    expect(store.getState().save.drafts["board-shell"]).toBe("guest");
    store.disconnect();
    store.connect("alice", server().remote);
    await store.reconcile();
    expect(store.getState().save.drafts["board-shell"]).toBe("alice private");
  });
  it("does not resurrect a manually deleted save and supports blocked storage", () => {
    const storage = memory();
    const store = new ProgressStore(storage);
    store.checkpoint();
    storage.values.delete(KEY);
    store.update(codeSave("still in memory"));
    expect(store.getState().saved).toBe(false);
    expect(storage.getItem(KEY)).toBeNull();
    const blocked = new ProgressStore(null);
    blocked.update(codeSave("session only"));
    expect(blocked.getState().saved).toBe(false);
    expect(blocked.getState().save.drafts["board-shell"]).toBe("session only");
  });
  it("rejects corrupt and incompatible cloud snapshots", () => {
    expect(
      decodeSnapshot({ save: { version: 5 }, modifiedAt: 1000 }),
    ).toBeNull();
    expect(decodeSnapshot({ save: fresh(), modifiedAt: NaN })).toBeNull();
    expect(decodeSnapshot({ save: fresh(), modifiedAt: -1 })).toBeNull();
  });
});
