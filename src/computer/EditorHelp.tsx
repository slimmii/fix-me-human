import { useState } from "react";
import { unlockedTopics } from "../course";
import { ContentScreen, LessonMarkdown } from "./ContentScreen";

export function EditorHelp({
  completed,
  keyboardActive,
  onClose,
}: {
  completed: string[];
  keyboardActive: boolean;
  onClose: () => void;
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
          [×]
        </button>
      </header>
      <ContentScreen
        title={page?.title ?? "Course topics"}
        eyebrow={topic?.title ?? "YOUR REFERENCE LIBRARY"}
        contentKey={page?.id ?? "course-topics"}
        keyboardActive={keyboardActive}
        courseNavigation={!!topic}
        onPrevious={previous}
        onNext={next}
        actions={
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
            <button onClick={onClose}>Return to editor · Esc</button>
          </>
        }
      >
        {page ? (
          <LessonMarkdown path={page.markdown} />
        ) : (
          <>
            <div className="lesson-markdown">
              <p>
                Choose a topic to read. Complete tasks to unlock more course
                material. Once unlocked, topics stay available when you revisit
                earlier tasks.
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
        )}
      </ContentScreen>
    </aside>
  );
}
