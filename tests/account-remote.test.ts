import { expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { progressRemote } from "../src/account/supabase";
import { snapshot } from "../src/account/progress-store";
import { fresh } from "../src/progression";

it("rejects a stale save before sending it under a different account", async () => {
  const rpc = vi.fn();
  const client = {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "bob" }, access_token: "bob-token" } },
        error: null,
      }),
    },
    rpc,
  } as unknown as SupabaseClient;
  await expect(
    progressRemote(client).write("alice", snapshot(fresh(), 1000)),
  ).rejects.toThrow("account changed");
  expect(rpc).not.toHaveBeenCalled();
});

it("binds an in-flight upload to its original owner's token", async () => {
  const value = snapshot(fresh(), 1000);
  let account = "alice";
  const headers = new Map<string, string>();
  const request = {
    setHeader: (key: string, value: string) => {
      headers.set(key, value);
      return request;
    },
    abortSignal: () => request,
    retry: async () => ({
      data: [{ state: value.save, modified_at: new Date(1000).toISOString() }],
      error: null,
    }),
  };
  const client = {
    auth: {
      getSession: async () => ({
        data: {
          session: { user: { id: account }, access_token: `${account}-token` },
        },
        error: null,
      }),
    },
    rpc: () => {
      account = "bob";
      return request;
    },
  } as unknown as SupabaseClient;
  await progressRemote(client).write("alice", value);
  expect(account).toBe("bob");
  expect(headers.get("Authorization")).toBe("Bearer alice-token");
});
