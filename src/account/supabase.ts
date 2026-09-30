import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { decodeSnapshot, type ProgressRemote } from "./progress-store";
import { decodeWorkstationId } from "../game/workstation";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Capture before Auth processes the callback and React's effects clean the URL.
const callback =
  typeof window === "undefined" ? null : new URL(window.location.href);
export const oauthCallbackError = !!(
  callback?.searchParams.has("error") ||
  (callback && new URLSearchParams(callback.hash.slice(1)).has("error"))
);
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          flowType: "pkce",
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          fetch: (input, init) =>
            fetch(input, {
              ...init,
              signal: init?.signal
                ? AbortSignal.any([init.signal, AbortSignal.timeout(10_000)])
                : AbortSignal.timeout(10_000),
            }),
        },
      })
    : null;

function fromRow(row: {
  state: unknown;
  modified_at: string;
  reset_version?: number;
  workstation_id?: unknown;
}) {
  const workstationId = decodeWorkstationId(row.workstation_id);
  if (row.workstation_id !== undefined && !workstationId)
    throw new Error("This cloud save has an invalid workstation assignment.");
  const state =
    workstationId &&
    row.state &&
    typeof row.state === "object" &&
    !Array.isArray(row.state)
      ? { ...row.state, workstationId }
      : row.state;
  const value = decodeSnapshot({
    save: state,
    modifiedAt: Date.parse(row.modified_at),
    resetVersion: row.reset_version ?? 0,
  });
  if (!value)
    throw new Error("This cloud save is incompatible. Local progress is safe.");
  return value;
}
export function progressRemote(client: SupabaseClient): ProgressRemote {
  async function authorization(userId: string) {
    const { data, error } = await client.auth.getSession();
    if (error || data.session?.user.id !== userId)
      throw new Error("The account changed before this save could sync.");
    // Bind each request to its owner even if Auth switches accounts while the
    // SDK prepares the request. An old snapshot must never use a new JWT.
    return `Bearer ${data.session.access_token}`;
  }
  return {
    async read(userId) {
      const bearer = await authorization(userId);
      const { data, error } = await client
        .from("pfh_progress")
        .select("state, modified_at, reset_version, workstation_id")
        .eq("user_id", userId)
        .setHeader("Authorization", bearer)
        .abortSignal(AbortSignal.timeout(10_000))
        .maybeSingle()
        .retry(false);
      if (error) throw error;
      return data ? fromRow(data) : null;
    },
    async write(userId, snapshot) {
      const bearer = await authorization(userId);
      const { data, error } = await client
        .rpc("pfh_sync_progress", {
          p_state: snapshot.save,
          p_modified_at: new Date(snapshot.modifiedAt).toISOString(),
          p_reset_version: snapshot.resetVersion ?? 0,
        })
        .setHeader("Authorization", bearer)
        .abortSignal(AbortSignal.timeout(10_000))
        .retry(false);
      if (error) throw error;
      if (!data?.[0]) throw new Error("Cloud save was not acknowledged.");
      return fromRow(data[0]);
    },
    async reset(userId, snapshot) {
      const bearer = await authorization(userId);
      const { data, error } = await client
        .rpc("pfh_reset_progress", {
          p_state: snapshot.save,
          p_expected_reset_version: snapshot.resetVersion ?? 0,
        })
        .setHeader("Authorization", bearer)
        .abortSignal(AbortSignal.timeout(10_000))
        .retry(false);
      if (error) throw error;
      if (!data?.[0]) throw new Error("Reset was not acknowledged.");
      return fromRow(data[0]);
    },
  };
}
export const normalizeUsername = (value: string) => value.trim().toLowerCase();
export const validUsername = (value: string) => /^[a-z0-9_]{3,20}$/.test(value);
export const suggestedUsername = (value: unknown) =>
  typeof value === "string"
    ? value
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 20)
    : "";
