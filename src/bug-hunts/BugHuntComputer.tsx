import { useEffect, useRef, useState } from "react";
import type { GameController } from "../game/useGame";
import TypedComputer from "../TypedComputer";
import { ContentScreen } from "../computer/ContentScreen";
import { sound } from "../audio";
import {
  HUNT_PAGE_SIZE,
  huntKey,
  listHunts,
  loadHunt,
  type BugHunt,
  type HuntSummary,
} from "./catalog";
import {
  finishHuntRun,
  recordHuntRun,
  startHunt,
  type HuntProgress,
  type RunResult,
} from "./progress";
import "./bug-hunts.css";

const date = (value: string | number) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export function BugHuntComputer({ game }: { game: GameController }) {
  const [hunts, setHunts] = useState<HuntSummary[]>([]);
  const [selected, setSelected] = useState<BugHunt | null>(null);
  const [pane, setPane] = useState<"board" | "brief" | "editor">("board");
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeResult, setNoticeResult] = useState<RunResult | null>(null);
  const [practiceResult, setPracticeResult] = useState<RunResult | null>(null);
  const request = useRef<AbortController | null>(null);
  const fetching = useRef(false);
  const count = useRef(0);
  count.current = hunts.length;
  async function refresh(append = false) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    fetching.current = true;
    setLoading(true);
    setError("");
    try {
      const rows = await listHunts(
        append ? count.current : 0,
        AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
      );
      if (controller.signal.aborted) return;
      setHunts((previous) =>
        append
          ? [
              ...previous,
              ...rows.filter(
                (row) => !previous.some((item) => item.id === row.id),
              ),
            ]
          : rows,
      );
      setMore(rows.length === HUNT_PAGE_SIZE);
    } catch (reason) {
      if (!controller.signal.aborted) setError((reason as Error).message);
    } finally {
      if (!controller.signal.aborted) {
        fetching.current = false;
        setLoading(false);
      }
    }
  }
  useEffect(() => {
    if (pane !== "board") return;
    void refresh();
    const refreshVisible = () => {
      if (
        !document.hidden &&
        !fetching.current &&
        count.current <= HUNT_PAGE_SIZE
      )
        void refresh();
    };
    const timer = setInterval(refreshVisible, 60000);
    window.addEventListener("focus", refreshVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refreshVisible);
      request.current?.abort();
    };
  }, [pane]);
  useEffect(() => () => request.current?.abort(), []);
  async function choose(hunt: HuntSummary) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    fetching.current = true;
    setLoading(true);
    setError("");
    try {
      const details = await loadHunt(
        hunt.id,
        AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
      );
      if (controller.signal.aborted) return;
      setSelected(details);
      setPane("brief");
      setNotice("");
      setPracticeResult(null);
    } catch (reason) {
      if (!controller.signal.aborted) setError((reason as Error).message);
    } finally {
      if (!controller.signal.aborted) {
        fetching.current = false;
        setLoading(false);
      }
    }
  }
  const key = selected ? huntKey(selected) : "";
  const progress = game.save.bugHunts[key];
  const practice = progress?.completedAt != null;
  const visibleResult = practiceResult ?? progress?.lastResult;
  function update(change: (progress: HuntProgress) => HuntProgress) {
    if (!selected) return;
    game.setSave((current) => {
      const previous = current.bugHunts[key];
      const next = change(previous ?? startHunt(selected.project));
      return next === previous
        ? current
        : {
            ...current,
            bugHunts: { ...current.bugHunts, [key]: next },
          };
    });
  }
  function leave() {
    game.setHelpOpen(false);
    game.dispatch({ type: "enter" });
    game.setComputerApp("basic");
  }
  const active = game.focused && !game.settings && !game.accountOpen;
  const navigation = (
    <nav className="hunt-navigation" aria-label="Bug hunt navigation">
      {pane === "editor" && (
        <button onClick={() => setPane("brief")}>Brief & results</button>
      )}
      <button
        aria-label="Wanted board"
        title="Wanted board"
        onClick={() => {
          setPane("board");
          game.setHelpOpen(false);
        }}
      >
        {pane === "editor" ? "Wanted" : "Wanted board"}
      </button>
      <button
        onClick={leave}
        aria-label="Back to course"
        title="Back to course"
      >
        {pane === "editor" ? "Course" : "Back to course"}
      </button>
    </nav>
  );
  return (
    <section
      className="hunt-app"
      aria-label="Bug hunts"
      onKeyDownCapture={(event) => {
        if (pane === "editor" && notice && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setNotice("");
        }
      }}
    >
      {pane === "brief" && (
        <header className="hunt-toolbar">
          <b>★ B.U.G. / WANTED</b>
          {navigation}
        </header>
      )}
      {pane === "board" ? (
        <ContentScreen
          title="Bug hunts"
          eyebrow="WANTED / CASE FILES"
          contentKey="bug-hunt-list"
          keyboardActive={active}
          actions={
            <>
              <button disabled={loading} onClick={() => void refresh()}>
                Refresh
              </button>
              {more && (
                <button disabled={loading} onClick={() => void refresh(true)}>
                  Older bug hunts
                </button>
              )}
              <button onClick={leave}>Back to course</button>
            </>
          }
        >
          <div className="lesson-markdown">
            <p>
              Open the latest bug hunt or return to an older case. Each hunt
              keeps its own saved code and statistics.
            </p>
          </div>
          {error && <p role="alert">{error}</p>}
          {loading && <p role="status">Loading cases…</p>}
          {!loading && !error && !hunts.length && (
            <p>No hunts published yet. Check back soon.</p>
          )}
          <ul className="terminal-list" aria-label="Available bug hunts">
            {hunts.map((hunt, index) => {
              const saved = game.save.bugHunts[huntKey(hunt)];
              return (
                <li key={hunt.id}>
                  <button
                    aria-label={`Open bug hunt: ${hunt.title}`}
                    disabled={loading}
                    onClick={() => void choose(hunt)}
                  >
                    <span>
                      <b>{hunt.title}</b>
                      <small>
                        {index === 0 ? "Latest" : "Archive"} ·{" "}
                        <time dateTime={hunt.publishDateTime}>
                          {date(hunt.publishDateTime)}
                        </time>
                      </small>
                      {saved && (
                        <small>
                          {saved.runs} runs ·{" "}
                          {saved.compileErrors +
                            saved.runtimeErrors +
                            saved.timeouts}{" "}
                          errors
                        </small>
                      )}
                    </span>
                    <span>
                      {saved?.completedAt
                        ? "Solved ✓"
                        : saved
                          ? "In progress"
                          : "Ready"}{" "}
                      →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="hunt-save-note">
            {game.saved
              ? "Your drafts and statistics are saved with your player progress."
              : "Local saving is paused. Your work is only available in this session."}
          </p>
        </ContentScreen>
      ) : selected && pane === "brief" ? (
        <div className="hunt-brief hunt-scroll">
          <span className="hunt-eyebrow">
            CASE FILE · {date(selected.publishDateTime)} · REVISION{" "}
            {selected.revision}
          </span>
          <h1>{selected.title}</h1>
          <p className="hunt-description">{selected.brief}</p>
          <p>
            Evidence: {Object.keys(selected.project.files).join(", ")}. Edit the
            code, then press F5 to run the checks. A passing run automatically
            solves the hunt.
          </p>
          <button
            className="primary"
            onClick={() => {
              update((p) => p);
              setPane("editor");
            }}
          >
            {practice
              ? "Reopen for practice"
              : progress
                ? "Continue hunt"
                : "Start hunt"}
          </button>
          {practice && (
            <p>
              Practice only. Your original solve statistics and completion date
              stay unchanged. Code edits still save automatically.
            </p>
          )}
          {progress && (
            <>
              <h2>
                {progress.completedAt
                  ? `Solved ${date(progress.completedAt)}`
                  : "Your case notes"}
              </h2>
              <dl className="hunt-stats">
                {[
                  ["Runs", progress.runs],
                  ["Passed", progress.successfulRuns],
                  ["Failed runs", progress.failedRuns],
                  ["Compile errors", progress.compileErrors],
                  ["Runtime errors", progress.runtimeErrors],
                  ["Timeouts", progress.timeouts],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              {visibleResult && (
                <section aria-label="Latest check results">
                  <h2>
                    {practiceResult
                      ? "Latest practice run"
                      : practice
                        ? "Recorded solve"
                        : "Latest run"}
                  </h2>
                  {visibleResult.error && (
                    <p role="alert">{visibleResult.error}</p>
                  )}
                  <ul className="hunt-checks">
                    {visibleResult.checks.map((check, i) => (
                      <li key={i} data-pass={check.pass}>
                        <b>
                          {check.pass ? "✓" : "×"} {check.label}
                        </b>
                        {check.detail && <p>{check.detail}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      ) : (
        selected && (
          <>
            <div className="hunt-workspace">
              {notice && (
                <aside className="hunt-notice" aria-label="Hunt feedback">
                  <div className="hunt-notice-heading">
                    <span role="status">{notice}</span>
                    <button
                      onClick={() => setNotice("")}
                      aria-label="Dismiss hunt message"
                    >
                      ×
                    </button>
                  </div>
                  {!!noticeResult?.checks.length && (
                    <details>
                      <summary>
                        Check details (
                        {
                          noticeResult.checks.filter((check) => check.pass)
                            .length
                        }
                        /{noticeResult.checks.length} passed)
                      </summary>
                      <ul className="hunt-checks">
                        {noticeResult.checks.map((check, index) => (
                          <li key={index} data-pass={check.pass}>
                            <b>
                              {check.pass ? "✓" : "×"} {check.label}
                            </b>
                            {check.detail && <p>{check.detail}</p>}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </aside>
              )}
              <TypedComputer
                key={key}
                workspaceNavigation={navigation}
                exercise={{
                  id: selected.slug,
                  title: selected.title,
                  brief: "",
                  hints: [],
                  solution: "",
                  multiFile: true,
                  validation: {
                    source: [
                      {
                        type: "exported-component",
                        label: "Export a React component",
                      },
                    ],
                    runtime: [],
                  },
                }}
                testCode={selected.testCode}
                previewCss={selected.previewCss}
                focused={active}
                completed={game.save.completed}
                project={progress?.project ?? selected.project}
                onChange={(project) => update((p) => ({ ...p, project }))}
                onRunStart={() => {
                  setNotice("");
                  setNoticeResult(null);
                  setPracticeResult(null);
                  update(recordHuntRun);
                }}
                onRunResult={(result) => {
                  setNoticeResult(result);
                  if (practice) setPracticeResult(result);
                  update((p) => finishHuntRun(p, result));
                  setNotice(
                    result.outcome === "passed"
                      ? practice
                        ? "Practice checks passed. Your original statistics are unchanged."
                        : "Case closed! Your fix and statistics are saved."
                      : (result.error ??
                          `${result.checks.filter((c) => !c.pass).length} checks failed.`),
                  );
                }}
                onOpenTasks={() => setPane("board")}
                onPass={() => setPane("board")}
                onExit={leave}
                onActivity={(event, detail) => {
                  if (event === "aside" && detail) {
                    setNoticeResult(null);
                    setNotice(detail);
                  }
                }}
                onBug={() => {
                  if (!practice) game.reportBug();
                }}
                onKey={() => sound(game.save.settings.mute)}
                reduced={game.save.settings.reducedMotion}
                fontSize={game.save.settings.screenFontSize}
                helpOpen={game.helpOpen}
                onHelp={() => game.setHelpOpen(true)}
                onCloseHelp={() => game.setHelpOpen(false)}
              />
            </div>
          </>
        )
      )}
    </section>
  );
}
