import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AccountController } from "./useAccount";
import { suggestedUsername } from "./supabase";

function AccountDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current!;
    dialog.showModal();
    // Native modal dialogs trap focus and make the 3D scene/iframes inert.
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const controls = [
          ...dialog.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
          ),
        ].filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (
          !first ||
          (event.shiftKey
            ? document.activeElement === first
            : document.activeElement === last)
        ) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
      }
      if (["F1", "F5", "F6"].includes(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close.current?.();
      }
    };
    document.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("keydown", escape, true);
      dialog.close();
      // The editor also focuses itself when its keyboard controls resume.
      // Restore the initiating control after those React effects have run.
      requestAnimationFrame(() => {
        if (
          previous instanceof HTMLElement &&
          previous.isConnected &&
          !document.querySelector(".account-dialog[open]")
        )
          previous.focus();
      });
    };
  }, []);
  return (
    <dialog
      className="account-dialog"
      ref={ref}
      aria-labelledby="account-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
    >
      <span className="eyebrow">B.U.G. / HUMAN RESOURCES</span>
      <h2 id="account-dialog-title">{title}</h2>
      {children}
    </dialog>
  );
}

function UsernameForm({ account }: { account: AccountController }) {
  const [name, setName] = useState(() =>
    suggestedUsername(
      account.user?.user_metadata.user_name ??
        account.user?.user_metadata.preferred_username,
    ),
  );
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void account.claimUsername(name);
      }}
    >
      <p>
        What should I call you, human? Choose your unique name for this office.
      </p>
      <label htmlFor="account-username">Username</label>
      <input
        id="account-username"
        name="username"
        autoComplete="nickname"
        autoCapitalize="none"
        spellCheck={false}
        minLength={3}
        maxLength={20}
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-describedby={`username-help${account.error ? " account-error" : ""}`}
        aria-invalid={!!account.error}
        disabled={account.busy}
        autoFocus
      />
      <p id="username-help" className="account-help">
        3–20 letters, numbers, or underscores. Names are saved in lowercase.
      </p>
      {account.error && (
        <p id="account-error" className="account-error" role="alert">
          {account.error}
        </p>
      )}
      <div className="account-actions">
        <button className="primary" type="submit" disabled={account.busy}>
          {account.busy ? "Saving…" : "Save username"}
        </button>
        <button type="button" onClick={() => void account.signOut()}>
          Continue as a guest
        </button>
      </div>
    </form>
  );
}

export function AccountControls({ account }: { account: AccountController }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [clearGuest, setClearGuest] = useState(false);
  useEffect(() => {
    if (!confirmReset) setClearGuest(false);
  }, [confirmReset]);
  useEffect(() => {
    if (account.dialog !== "profile") setConfirmReset(false);
  }, [account.dialog, account.user?.id]);
  const [failedAvatar, setFailedAvatar] = useState(false);
  const avatar = account.user?.user_metadata.avatar_url;
  const avatarUrl =
    typeof avatar === "string" && avatar.startsWith("https://")
      ? avatar
      : undefined;
  useEffect(() => setFailedAvatar(false), [avatarUrl]);
  const status =
    account.progress.status === "syncing"
      ? "Syncing"
      : account.progress.status === "synced"
        ? "Synced"
        : account.progress.saved
          ? "Saved locally—sync pending"
          : "This session only—sync pending";
  return (
    <aside className="account-controls" aria-label="Account">
      <button
        className={account.user ? "account-avatar" : "account-sign-in"}
        onClick={account.open}
        disabled={account.busy}
        aria-label={account.user ? "Open profile" : "Sign in"}
        title={account.username ?? "Sign in with GitHub"}
      >
        {account.user ? (
          avatarUrl && !failedAvatar ? (
            <img
              src={avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setFailedAvatar(true)}
            />
          ) : (
            <span aria-hidden="true">
              {(account.username ?? "?").slice(0, 2).toUpperCase()}
            </span>
          )
        ) : (
          "Sign in"
        )}
      </button>
      {account.dialog === "loading" && (
        <AccountDialog
          title="Checking your office pass…"
          onClose={account.cancelInitialization}
        >
          <p role="status">Restoring your sign-in.</p>
          <button onClick={account.cancelInitialization}>
            Continue without signing in
          </button>
        </AccountDialog>
      )}
      {account.dialog === "progress" && (
        <AccountDialog
          title="Opening your saved desk…"
          onClose={() => void account.signOut()}
        >
          <p role="status">Loading your latest progress.</p>
          <button onClick={() => void account.signOut()}>
            Continue as a guest
          </button>
        </AccountDialog>
      )}
      {account.dialog === "invitation" && (
        <AccountDialog title="Welcome, human." onClose={account.dismiss}>
          <div
            className="account-intro-avatar robot-avatar neutral"
            aria-hidden="true"
          >
            <i />
            <i />
            <span />
          </div>
          <p>
            I’m B.U.G., your extremely qualified supervisor. Sign in with GitHub
            to carry your course progress and bug hunts between computers.
            Prefer to remain an unidentified human? You can keep playing without
            an account.
          </p>
          <p className="account-help">
            Playing as a guest saves your progress on this computer.
          </p>
          {account.error && (
            <p className="account-error" role="alert">
              {account.error}
            </p>
          )}
          <div className="account-actions">
            <button
              className="primary"
              onClick={() => void account.signIn()}
              disabled={account.busy}
            >
              {account.busy ? "Opening GitHub…" : "Sign in with GitHub"}
            </button>
            <button onClick={account.dismiss}>
              Continue without signing in
            </button>
          </div>
        </AccountDialog>
      )}
      {account.dialog === "username" && (
        <AccountDialog
          title="Your human identity."
          onClose={() => void account.signOut()}
        >
          {account.profileLoading ? (
            <p role="status">Looking up your profile…</p>
          ) : account.profileError ? (
            <>
              <p role="alert" className="account-error">
                {account.profileError}
              </p>
              <div className="account-actions">
                <button className="primary" onClick={account.retryProfile}>
                  Retry
                </button>
                <button
                  onClick={() => void account.signOut()}
                  disabled={account.busy}
                >
                  Continue as a guest
                </button>
              </div>
            </>
          ) : (
            <UsernameForm key={account.user?.id} account={account} />
          )}
          {account.profileLoading && (
            <button
              onClick={() => void account.signOut()}
              disabled={account.busy}
            >
              Continue as a guest
            </button>
          )}
        </AccountDialog>
      )}
      {account.dialog === "profile" && (
        <AccountDialog
          title={
            confirmReset
              ? "Remove all progress?"
              : `Hello, ${account.username}.`
          }
          onClose={
            account.busy
              ? undefined
              : confirmReset
                ? () => setConfirmReset(false)
                : account.closeMenu
          }
        >
          {confirmReset ? (
            <>
              <p>
                This permanently removes your saved code, completed assignments,
                and game progress, including bug hunt drafts and statistics,
                from this account. It cannot be undone.
              </p>
              <p className="account-help">
                Your username, GitHub sign-in, and device settings stay
                unchanged. Other devices will start fresh when they reconnect.
              </p>
              <label className="account-guest-toggle">
                <input
                  type="checkbox"
                  role="switch"
                  checked={clearGuest}
                  disabled={account.busy}
                  onChange={(event) => setClearGuest(event.target.checked)}
                  aria-describedby="guest-reset-help"
                />
                <span>Also clear my guest save</span>
              </label>
              <p id="guest-reset-help" className="account-help">
                {clearGuest
                  ? "This also removes guest progress and its backup from this browser. Signing out will start a new guest game."
                  : "Your separate guest save in this browser will be kept."}
              </p>
              {account.error && (
                <p className="account-error" role="alert">
                  {account.error}
                </p>
              )}
              <div className="account-actions">
                <button
                  autoFocus
                  disabled={account.busy}
                  onClick={() => setConfirmReset(false)}
                >
                  Keep my progress
                </button>
                <button
                  className="account-danger"
                  disabled={account.busy}
                  onClick={async () => {
                    if (await account.resetProgress(clearGuest))
                      setConfirmReset(false);
                  }}
                >
                  {account.busy
                    ? "Removing progress…"
                    : "Yes, remove all progress"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="account-sync" role="status">
                {status}
              </p>
              <p>
                Your GitHub account carries your code, bug hunts and assignment
                progress between computers.
              </p>
              {account.notice && <p role="status">{account.notice}</p>}
              {account.error && (
                <p className="account-error" role="alert">
                  {account.error}
                </p>
              )}
              <div className="account-actions">
                <button className="primary" onClick={account.closeMenu}>
                  Back to work
                </button>
                {account.progress.status === "pending" && (
                  <button onClick={() => void account.store.reconcile()}>
                    Retry sync
                  </button>
                )}
                <button
                  onClick={() => void account.signOut()}
                  disabled={account.busy}
                >
                  {account.busy ? "Signing out…" : "Sign out"}
                </button>
              </div>
              <div className="account-reset">
                <button
                  className="account-danger"
                  disabled={account.busy}
                  onClick={() => setConfirmReset(true)}
                >
                  Remove all progress
                </button>
              </div>
            </>
          )}
        </AccountDialog>
      )}
    </aside>
  );
}
