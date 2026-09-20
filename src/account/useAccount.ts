import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import {
  accountKey,
  browserStorage,
  INTRO_KEY,
  ProgressStore,
} from "./progress-store";
import {
  normalizeUsername,
  oauthCallbackError,
  progressRemote,
  supabase,
  validUsername,
} from "./supabase";

function cachedUsername(id: string): string | null {
  try {
    const name = browserStorage()?.getItem(`${accountKey(id)}:profile`);
    return name && validUsername(name) ? name : null;
  } catch {
    return null;
  }
}
function rememberUsername(id: string, name: string | null) {
  try {
    const storage = browserStorage();
    if (name) storage?.setItem(`${accountKey(id)}:profile`, name);
    else storage?.removeItem(`${accountKey(id)}:profile`);
  } catch {
    /* A cached profile is optional. */
  }
}

export function useAccount() {
  const [store] = useState(() => new ProgressStore(browserStorage()));
  const progress = useSyncExternalStore(store.subscribe, store.getState);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(!!supabase);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [invitation, setInvitation] = useState(() => {
    try {
      return browserStorage()?.getItem(INTRO_KEY) !== "dismissed";
    } catch {
      return true;
    }
  });
  const [menu, setMenu] = useState(false);
  const identity = useRef<string | null>(null);
  const actionVersion = useRef(0);
  const signingOut = useRef(false);

  const dismiss = () => {
    try {
      browserStorage()?.setItem(INTRO_KEY, "dismissed");
    } catch {
      /* Browser may block storage. */
    }
    setInvitation(false);
    setError("");
  };
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let receivedSession = false;
    if (oauthCallbackError) {
      setError(
        "GitHub sign-in was cancelled or could not be completed. You can try again or keep playing.",
      );
      setInvitation(true);
    }
    function cleanCallback() {
      const url = new URL(window.location.href);
      for (const key of ["code", "error", "error_code", "error_description"])
        url.searchParams.delete(key);
      if (new URLSearchParams(url.hash.slice(1)).has("error")) url.hash = "";
      window.history.replaceState(window.history.state, "", url);
    }
    function sessionChanged(next: User | null) {
      if (!active || (signingOut.current && next)) return;
      receivedSession = true;
      if (identity.current !== (next?.id ?? null)) {
        actionVersion.current++;
        store.disconnect();
        setUsername(null);
        setProfileError("");
        setProfileLoading(!!next);
        setMenu(false);
      }
      identity.current = next?.id ?? null;
      setUser(next);
      setBusy(false);
      setInitializing(false);
      if (next) {
        setInvitation(false);
        try {
          browserStorage()?.setItem(INTRO_KEY, "dismissed");
        } catch {
          /* Optional persistence. */
        }
      }
      cleanCallback();
    }
    // Keep this callback synchronous: querying inside it can deadlock Auth.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      sessionChanged(session?.user ?? null),
    );
    void Promise.all([supabase.auth.initialize(), supabase.auth.getSession()])
      .then(([initialization, { data, error }]) => {
        if (!active || signingOut.current) return;
        if (error || initialization.error) {
          setError(
            oauthCallbackError
              ? "GitHub sign-in was cancelled or could not be completed. You can try again or keep playing."
              : "Sign-in could not be restored. Try again or continue without signing in.",
          );
          setInvitation(true);
        }
        if (!receivedSession) sessionChanged(data.session?.user ?? null);
      })
      .catch(() => {
        if (active) {
          setInitializing(false);
          setError(
            "Sign-in is unavailable. Your local game is still available.",
          );
          setInvitation(true);
        }
      });
    const timeout = setTimeout(() => {
      if (active && !receivedSession) {
        setInitializing(false);
        setError(
          "Sign-in is taking too long. You can keep playing while it reconnects.",
        );
        setInvitation(true);
      }
    }, 10_000);
    return () => {
      active = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
      store.suspend();
    };
  }, [store]);

  const userId = user?.id;
  useEffect(() => {
    if (!userId || !supabase) return;
    const client = supabase;
    let active = true;
    setProfileLoading(true);
    setProfileError("");
    const cached = cachedUsername(userId);
    if (cached) {
      setUsername(cached);
      store.connect(userId, progressRemote(client));
    }
    void client
      .from("pfh_profiles")
      .select("username")
      .eq("user_id", userId)
      .abortSignal(AbortSignal.timeout(10_000))
      .maybeSingle()
      .retry(false)
      .then(({ data, error }) => {
        if (!active || signingOut.current || identity.current !== userId)
          return;
        setProfileLoading(false);
        if (error) {
          if (!cached)
            setProfileError(
              "Your profile could not be loaded. Retry or continue as a guest.",
            );
          return;
        }
        rememberUsername(userId, data?.username ?? null);
        setUsername(data?.username ?? null);
        if (data) store.connect(userId, progressRemote(client));
        else if (cached) store.disconnect();
      });
    return () => {
      active = false;
    };
  }, [userId, store, attempt]);

  useEffect(() => {
    const sync = () => {
      if (!document.hidden) void store.reconcile();
    };
    window.addEventListener("online", sync);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    const timer = setInterval(sync, 30_000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", sync);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [store]);

  async function signIn() {
    if (!supabase) {
      setError(
        "GitHub sign-in is not configured yet. You can still play and save on this computer.",
      );
      return;
    }
    const version = ++actionVersion.current;
    store.checkpoint();
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: new URL(import.meta.env.BASE_URL, window.location.origin)
            .href,
        },
      });
      if (error) throw error;
    } catch {
      if (version === actionVersion.current)
        setError(
          "GitHub sign-in could not start. Try again or continue without signing in.",
        );
    } finally {
      if (version === actionVersion.current) setBusy(false);
    }
  }
  async function claimUsername(value: string) {
    const name = normalizeUsername(value);
    if (!validUsername(name)) {
      setError("Use 3–20 letters, numbers, or underscores.");
      return;
    }
    if (!supabase || !user) return;
    const id = user.id;
    const version = ++actionVersion.current;
    setBusy(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("pfh_profiles")
        .insert({ user_id: id, username: name })
        .select("username")
        .abortSignal(AbortSignal.timeout(10_000))
        .single()
        .retry(false);
      if (version !== actionVersion.current || identity.current !== id) return;
      if (error) {
        // Another tab may have finished onboarding for this account already.
        if (error.code === "23505") {
          const existing = await supabase
            .from("pfh_profiles")
            .select("username")
            .eq("user_id", id)
            .abortSignal(AbortSignal.timeout(10_000))
            .maybeSingle()
            .retry(false);
          if (version !== actionVersion.current || identity.current !== id)
            return;
          if (existing.data) {
            rememberUsername(id, existing.data.username);
            setUsername(existing.data.username);
            store.connect(id, progressRemote(supabase));
            return;
          }
          setError("That username is already taken. Please choose another.");
        } else setError("Your username could not be saved. Please try again.");
        return;
      }
      setUsername(data.username);
      rememberUsername(id, data.username);
      store.connect(id, progressRemote(supabase));
    } catch {
      if (version === actionVersion.current)
        setError("Your username could not be saved. Please try again.");
    } finally {
      if (version === actionVersion.current) setBusy(false);
    }
  }
  async function signOut() {
    if (signingOut.current) return;
    signingOut.current = true;
    actionVersion.current++;
    setBusy(true);
    store.disconnect();
    try {
      const { error } = supabase
        ? await supabase.auth.signOut({ scope: "local" })
        : { error: null };
      // The SDK removes the local session even when server revocation fails.
      if (error && identity.current !== null) {
        setError("Sign-out could not finish. Please try again.");
        return;
      }
      identity.current = null;
      setUser(null);
      setUsername(null);
      setProfileError("");
      setMenu(false);
      dismiss();
    } catch {
      setError("Sign-out could not finish. Please try again.");
    } finally {
      signingOut.current = false;
      setBusy(false);
    }
  }
  const needsProfile = !!user && !username;
  const dialog = initializing
    ? "loading"
    : needsProfile
      ? "username"
      : progress.hydrating
        ? "progress"
        : invitation
          ? "invitation"
          : menu
            ? "profile"
            : null;
  return {
    store,
    progress,
    user,
    username,
    dialog,
    busy,
    error,
    profileLoading,
    profileError,
    configured: !!supabase,
    signIn,
    claimUsername,
    signOut,
    cancelInitialization: () => {
      setInitializing(false);
      dismiss();
      void signOut();
    },
    dismiss,
    closeMenu: () => setMenu(false),
    open: () => {
      setError("");
      if (user) setMenu(true);
      else setInvitation(true);
    },
    retryProfile: () => setAttempt((value) => value + 1),
  };
}
export type AccountController = ReturnType<typeof useAccount>;
