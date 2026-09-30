import { decode, fresh, KEY, type Save } from "../progression";
import {
  createOfficeClock,
  pauseOfficeClock,
  resumeOfficeClock,
} from "../game/officeTime";
import { createWorkstationId } from "../game/workstation";

export type ProgressSnapshot = {
  save: Omit<Save, "settings">;
  modifiedAt: number;
  resetVersion?: number;
};
export type ProgressRemote = {
  reset?: (
    userId: string,
    snapshot: ProgressSnapshot,
  ) => Promise<ProgressSnapshot>;
  read: (userId: string) => Promise<ProgressSnapshot | null>;
  write: (
    userId: string,
    snapshot: ProgressSnapshot,
  ) => Promise<ProgressSnapshot>;
};
export type SyncStatus = "guest" | "syncing" | "synced" | "pending";
type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;
export type ProgressState = {
  save: Save;
  saved: boolean;
  userId: string | null;
  modifiedAt: number;
  status: SyncStatus;
  restoration: number;
  hydrating: boolean;
  resetVersion: number;
};
export const INTRO_KEY = `${KEY}:account-introduction`;
export const accountKey = (id: string) => `${KEY}:account:${id}`;
const SETTINGS_KEY = `${KEY}:settings`;
const META_KEY = `${KEY}:sync`;

export function gameplayFingerprint(save: Omit<Save, "settings">) {
  const { officeClock, workstationId, ...progress } = save;
  // Settings are present on live Save objects, but never determine which
  // computer has the latest work. Neither do clock checkpoints or desk setup.
  const { settings: _settings, ...gameplay } = progress as typeof progress & {
    settings?: unknown;
  };
  return JSON.stringify(gameplay, (_key, value: unknown) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
        )
      : value,
  );
}
function samePersistedProgress(
  first: ProgressSnapshot,
  second: ProgressSnapshot,
) {
  // PostgreSQL jsonb reorders keys, and the v4 decoder expires transient hints.
  // Compare both saves as they would load so an unchanged cloud echo does not
  // reset the live editor or dismiss a hint that is still being displayed.
  return (
    gameplayFingerprint(decode(JSON.stringify(first.save))) ===
    gameplayFingerprint(decode(JSON.stringify(second.save)))
  );
}
export function snapshot(
  save: Save,
  modifiedAt: number,
  resetVersion = 0,
): ProgressSnapshot {
  const { settings: _settings, ...progress } = save;
  return {
    save: {
      ...progress,
      officeClock: progress.officeClock
        ? pauseOfficeClock(progress.officeClock)
        : null,
    },
    modifiedAt,
    resetVersion,
  };
}
export function decodeSnapshot(value: unknown): ProgressSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as ProgressSnapshot;
  if (
    !raw.save ||
    raw.save.version !== 4 ||
    typeof raw.save.assignmentId !== "string" ||
    typeof raw.save.lessonId !== "string" ||
    !Array.isArray(raw.save.completed) ||
    !raw.save.projects ||
    !raw.save.drafts ||
    !raw.save.story ||
    !Number.isSafeInteger(raw.modifiedAt) ||
    raw.modifiedAt < 0 ||
    (raw.resetVersion !== undefined &&
      (!Number.isSafeInteger(raw.resetVersion) || raw.resetVersion < 0))
  )
    return null;
  const { settings: _settings, ...save } = decode(JSON.stringify(raw.save));
  return {
    save,
    modifiedAt: raw.modifiedAt,
    resetVersion: raw.resetVersion ?? 0,
  };
}
function live(save: Save): Save {
  return {
    ...save,
    officeClock: (typeof document !== "undefined" && document.hidden
      ? pauseOfficeClock
      : resumeOfficeClock)(save.officeClock ?? createOfficeClock()),
    workstationId: save.workstationId ?? createWorkstationId(),
  };
}

/** Local writes are synchronous; cloud work is serialized and scoped to an
 * authentication generation so old responses cannot affect a new account. */
export class ProgressStore {
  private state: ProgressState;
  private listeners = new Set<() => void>();
  private remote: ProgressRemote | null = null;
  private generation = 0;
  private inFlight: Promise<void> | null = null;
  private resetting = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private written = new Set<string>();
  private paused = new Set<string>();
  private guest: ProgressSnapshot;
  private caches = new Map<string, ProgressSnapshot>();

  constructor(
    private storage: Storage | null,
    private now = Date.now,
  ) {
    const rawSave = this.read(KEY);
    const saved = decode(rawSave);
    const settings = this.read(SETTINGS_KEY);
    if (settings)
      saved.settings = decode(
        JSON.stringify({ ...saved, settings: this.parse(settings) }),
      ).settings;
    const meta = this.parse(this.read(META_KEY)) as {
      modifiedAt?: number;
      fingerprint?: string;
    } | null;
    // Compare metadata with what was actually written, before decoding expires
    // hints or migrates story cursors. Normalization must not erase edit time.
    const raw = this.parse(rawSave) as Save | null;
    const fingerprint = raw?.version === 4 ? gameplayFingerprint(raw) : null;
    const modifiedAt =
      meta?.fingerprint === fingerprint &&
      Number.isSafeInteger(meta?.modifiedAt) &&
      meta!.modifiedAt! >= 0
        ? meta!.modifiedAt!
        : 0;
    this.guest = snapshot(saved, modifiedAt);
    this.state = {
      save: live(saved),
      saved: true,
      userId: null,
      modifiedAt,
      status: "guest",
      restoration: 0,
      hydrating: false,
      resetVersion: 0,
    };
  }
  private parse(raw: string | null): unknown {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  private read(key: string): string | null {
    try {
      return this.storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  private emit(patch: Partial<ProgressState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getState = () => this.state;
  currentSnapshot = () =>
    snapshot(this.state.save, this.state.modifiedAt, this.state.resetVersion);

  update = (action: Save | ((previous: Save) => Save), gameplay = true) => {
    if (this.resetting) return;
    const save =
      typeof action === "function" ? action(this.state.save) : action;
    if (save === this.state.save) return;
    const changed =
      gameplay &&
      gameplayFingerprint(save) !== gameplayFingerprint(this.state.save);
    const modifiedAt = changed
      ? Math.max(this.now(), this.state.modifiedAt + 1)
      : this.state.modifiedAt;
    this.emit({
      save,
      modifiedAt,
      ...(changed && this.remote ? { status: "pending" as const } : {}),
    });
    this.checkpoint();
    if (changed) this.schedule();
  };
  checkpoint = () => {
    const { userId, save } = this.state;
    const current = this.currentSnapshot();
    if (userId) this.caches.set(userId, current);
    else this.guest = current;
    const key = userId ? accountKey(userId) : KEY;
    let saved = false;
    try {
      if (!this.storage) throw new Error("Storage unavailable");
      if (this.written.has(key) && this.storage.getItem(key) === null)
        this.paused.add(key);
      if (!this.paused.has(key)) {
        this.storage.setItem(
          key,
          JSON.stringify(
            userId ? current : { ...current.save, settings: save.settings },
          ),
        );
        if (!userId)
          this.storage.setItem(
            META_KEY,
            JSON.stringify({
              modifiedAt: current.modifiedAt,
              fingerprint: gameplayFingerprint(current.save),
            }),
          );
        this.storage.setItem(SETTINGS_KEY, JSON.stringify(save.settings));
        this.written.add(key);
        saved = true;
      }
    } catch {
      /* Session-only play is supported. */
    }
    if (saved !== this.state.saved) this.emit({ saved });
    return saved;
  };
  private backup(value: ProgressSnapshot) {
    const key = this.state.userId ? accountKey(this.state.userId) : KEY;
    try {
      this.storage?.setItem(`${key}:backup`, JSON.stringify(value));
    } catch {
      /* Keep playing if storage is full. */
    }
  }
  private restore(value: ProgressSnapshot) {
    if ((value.resetVersion ?? 0) > this.state.resetVersion) {
      try {
        this.storage?.removeItem(`${accountKey(this.state.userId!)}:backup`);
      } catch {
        /* Storage may be unavailable. */
      }
    } else this.backup(this.currentSnapshot());
    this.emit({
      save: live({ ...value.save, settings: this.state.save.settings }),
      modifiedAt: value.modifiedAt,
      resetVersion: value.resetVersion ?? 0,
      restoration: this.state.restoration + 1,
    });
    this.checkpoint();
  }
  connect(userId: string, remote: ProgressRemote) {
    if (this.state.userId === userId && this.remote) return;
    this.checkpoint();
    this.cancel();
    this.remote = remote;
    const cached =
      this.caches.get(userId) ??
      decodeSnapshot(this.parse(this.read(accountKey(userId))));
    // Import only the independent guest save, never another user's cache.
    const value =
      cached &&
      ((cached.resetVersion ?? 0) > 0 ||
        cached.modifiedAt >= this.guest.modifiedAt)
        ? cached
        : this.guest;
    this.emit({
      userId,
      save: live({ ...value.save, settings: this.state.save.settings }),
      modifiedAt: value.modifiedAt,
      resetVersion: value.resetVersion ?? 0,
      status: "pending",
      hydrating: true,
      restoration: this.state.restoration + 1,
    });
    if (cached && value !== cached) this.backup(cached);
    this.checkpoint();
    void this.reconcile();
  }
  disconnect = () => {
    this.checkpoint();
    this.cancel();
    if (!this.state.userId) return;
    this.emit({
      userId: null,
      save: live({ ...this.guest.save, settings: this.state.save.settings }),
      modifiedAt: this.guest.modifiedAt,
      status: "guest",
      hydrating: false,
      resetVersion: 0,
      restoration: this.state.restoration + 1,
    });
    this.checkpoint();
  };
  private cancel() {
    this.generation++;
    clearTimeout(this.timer);
    this.remote = null;
    this.inFlight = null;
    this.resetting = false;
  }
  suspend = () => {
    this.cancel();
  };
  private schedule() {
    clearTimeout(this.timer);
    if (this.remote)
      this.timer = setTimeout(() => {
        void this.reconcile();
      }, 1000);
  }
  reconcile = (): Promise<void> => {
    if (this.resetting) return Promise.resolve();
    if (this.inFlight) return this.inFlight;
    const { userId } = this.state;
    const remote = this.remote;
    if (!userId || !remote) return Promise.resolve();
    const generation = this.generation;
    const active = () => generation === this.generation;
    this.emit({ status: "syncing" });
    const task = (async () => {
      try {
        // Always read before writing, including after an offline start.
        const cloud = await remote.read(userId);
        if (!active()) return;
        const local = this.currentSnapshot();
        if (
          cloud &&
          ((cloud.resetVersion ?? 0) > (local.resetVersion ?? 0) ||
            cloud.modifiedAt >= local.modifiedAt)
        ) {
          if (
            cloud.resetVersion !== local.resetVersion ||
            cloud.modifiedAt !== local.modifiedAt ||
            !samePersistedProgress(cloud, local)
          )
            this.restore(cloud);
        } else {
          if (cloud) this.backup(cloud);
          const winner = await remote.write(userId, local);
          if (!active()) return;
          const current = this.currentSnapshot();
          // New typing during a request remains pending, with its original time.
          if (
            ((winner.resetVersion ?? 0) > (current.resetVersion ?? 0) ||
              winner.modifiedAt >= current.modifiedAt) &&
            (winner.resetVersion !== current.resetVersion ||
              winner.modifiedAt !== current.modifiedAt ||
              !samePersistedProgress(winner, current))
          )
            this.restore(winner);
          if (this.state.modifiedAt > winner.modifiedAt) {
            this.emit({ status: "pending" });
            this.schedule();
            return;
          }
        }
        this.emit({ status: "synced" });
      } catch {
        if (active()) this.emit({ status: "pending" });
      } finally {
        if (active()) {
          this.inFlight = null;
          if (this.state.hydrating) this.emit({ hydrating: false });
        }
      }
    })();
    this.inFlight = task;
    return task;
  };

  private clearGuestSave() {
    this.guest = snapshot(fresh(), 0);
    // This is an intentional removal, so future guest play may save again.
    this.written.delete(KEY);
    this.paused.delete(KEY);
    let cleared = !!this.storage;
    for (const key of [KEY, META_KEY, `${KEY}:backup`]) {
      try {
        this.storage?.removeItem(key);
      } catch {
        cleared = false;
      }
    }
    return cleared;
  }

  resetProgress = async ({ clearGuest = false } = {}) => {
    const { userId } = this.state;
    const remote = this.remote;
    if (!userId || !remote?.reset || this.resetting)
      throw new Error("Reset unavailable");
    const generation = this.generation;
    const active = () => generation === this.generation;
    this.resetting = true;
    clearTimeout(this.timer);
    try {
      // Drain this device's pending upload before issuing the destructive RPC.
      await this.inFlight;
      if (!active()) throw new Error("Account changed");
      const cloud = await remote.read(userId);
      if (!active()) throw new Error("Account changed");
      const value = await remote.reset(
        userId,
        snapshot(fresh(), this.now(), cloud?.resetVersion ?? 0),
      );
      if (!active()) throw new Error("Account changed");
      this.restore(value);
      const guestCleared = !clearGuest || this.clearGuestSave();
      this.emit({ status: "synced" });
      return { guestCleared };
    } finally {
      if (active()) {
        this.resetting = false;
        // Also recover when a reset committed but its response was lost.
        void this.reconcile();
      }
    }
  };
}

export function browserStorage(): globalThis.Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
