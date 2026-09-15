import { useEffect, useRef, useState, type ComponentProps } from "react";
import { unlockedTopics } from "../course";
import type { CoursePage } from "../course/types";
import { ContentScreen, LessonMarkdown } from "./ContentScreen";

function CourseMaterial({
  page,
  onJoke,
  ...reader
}: Omit<ComponentProps<typeof ContentScreen>, "children" | "onRead"> & {
  page: CoursePage;
  onJoke: (text: string) => void;
}) {
  const [read, setRead] = useState(false);
  const openedAt = useRef<number | null>(null);
  const finished = useRef(false);
  const tellJoke = useRef(onJoke);
  tellJoke.current = onJoke;

  useEffect(() => {
    if (!reader.keyboardActive || openedAt.current !== null) return;
    openedAt.current = performance.now();
    tellJoke.current(page.jokes.opened);
  }, [page, reader.keyboardActive]);

  useEffect(() => {
    if (
      !reader.keyboardActive ||
      !read ||
      finished.current ||
      openedAt.current === null
    )
      return;
    // Keep the opening line readable, including when the entire page fits.
    const remaining = Math.max(
      0,
      4000 - (performance.now() - openedAt.current),
    );
    const timer = window.setTimeout(() => {
      finished.current = true;
      tellJoke.current(page.jokes.read);
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [page, read, reader.keyboardActive]);

  return (
    <ContentScreen {...reader} onRead={() => setRead(true)}>
      <LessonMarkdown path={page.markdown} />
    </ContentScreen>
  );
}

export function EditorHelp({
  completed,
  keyboardActive,
  onClose,
  onJoke,
}: {
  completed: string[];
  keyboardActive: boolean;
  onClose: () => void;
  onJoke: (text: string) => void;
}) {
  const [topicId, setTopicId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const topics = unlockedTopics(completed);
  const topic = topics.find((topic) => topic.id === topicId);
  const page = topic?.pages[index];
  const previous = topic && index > 0 ? () => setIndex(index - 1) : undefined;
  const next =
    topic && index < topic.pages.length - 1
      ? () => setIndex(index + 1)
      : undefined;
  const reader = {
    title: page?.title ?? "Course topics",
    eyebrow: topic?.title ?? "YOUR REFERENCE LIBRARY",
    contentKey: page?.id ?? "course-topics",
    keyboardActive,
    courseNavigation: !!topic,
    onPrevious: previous,
    onNext: next,
    actions: (
      <>
        {topic && (
          <>
            <button disabled={!previous} onClick={previous}>
              ← Previous
            </button>
            <span aria-live="polite">
              Page {index + 1} of {topic.pages.length}
            </span>
            <button disabled={!next} onClick={next}>
              Next →
            </button>
            <button onClick={() => setTopicId(null)}>Topics</button>
          </>
        )}
      </>
    ),
  };
  return (
    <aside
      className="editor-help"
      aria-label="Course material"
      onKeyDown={(event) => {
        if (event.key === "Escape" || event.key === "F1") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <header>
        <b>HELP / Course material</b>
        <button aria-label="Close course material" onClick={onClose}>
          Editor · Esc
        </button>
      </header>
      {page ? (
        <CourseMaterial key={page.id} page={page} onJoke={onJoke} {...reader} />
      ) : (
        <ContentScreen {...reader}>
          <>
            <div className="lesson-markdown">
              <p>
                Choose a topic to learn the concepts through small examples.
                Your printed brief describes what to build. Complete tasks to
                unlock more topics; unlocked material stays available when you
                revisit earlier tasks.
              </p>
            </div>
            <ul className="terminal-list" aria-label="Unlocked course topics">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <button
                    aria-label={`Read topic: ${topic.title}`}
                    onClick={() => {
                      setIndex(0);
                      setTopicId(topic.id);
                    }}
                  >
                    <span>
                      <b>{topic.title}</b>
                      <small>{topic.description}</small>
                    </span>
                    <span>{topic.pages.length} pages →</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        </ContentScreen>
      )}
    </aside>
  );
}
