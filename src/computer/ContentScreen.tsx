import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Markdown from "react-markdown";
import { curriculum } from "../curriculum";
import { courseTopics } from "../course";
const pages = import.meta.glob<string>(
  ["../curriculum/**/*.md", "../course/**/*.md"],
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);
export const lessonText = (path: string) =>
  pages[path.startsWith("course/") ? `../${path}` : `../curriculum/${path}`] ??
  "";
for (const path of [
  ...curriculum.flatMap((lesson) =>
    lesson.assignments.map((assignment) => assignment.brief),
  ),
  ...courseTopics.flatMap((topic) => topic.pages.map((page) => page.markdown)),
]) {
  if (!lessonText(path).trim())
    throw new Error(`Missing Markdown content: ${path}`);
}
export function LessonMarkdown({ path }: { path: string }) {
  return (
    <div className="lesson-markdown">
      <Markdown skipHtml>{lessonText(path)}</Markdown>
    </div>
  );
}
export function ContentScreen({
  title,
  eyebrow,
  contentKey,
  children,
  actions,
  keyboardActive,
  onPrevious,
  onNext,
  courseNavigation = false,
}: {
  title: string;
  eyebrow: string;
  contentKey: string;
  children: ReactNode;
  actions: ReactNode;
  keyboardActive: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  courseNavigation?: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; top: number } | null>(null);
  const scrollId = useId();
  const [position, setPosition] = useState({ top: 0, height: 0, total: 0 });
  const maximum = Math.max(0, position.total - position.height);
  const thumbSize = position.total
    ? Math.max(8, (position.height / position.total) * 100)
    : 100;
  const progress = maximum ? position.top / maximum : 0;
  const scrollBy = (amount: number) =>
    scroll.current?.scrollBy({ top: amount, behavior: "instant" });

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    scroll.current?.scrollTo(0, 0);
    const viewport = scroll.current!;
    const measure = () =>
      setPosition({
        top: viewport.scrollTop,
        height: viewport.clientHeight,
        total: viewport.scrollHeight,
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(content.current!);
    viewport.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", measure);
    };
  }, [contentKey]);

  useEffect(() => {
    if (!keyboardActive) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          'input, textarea, select, [contenteditable="true"], [role="dialog"]',
        )
      )
        return;
      const viewport = scroll.current;
      if (!viewport) return;
      const keys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ];
      if (courseNavigation) keys.push("ArrowLeft", "ArrowRight");
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      switch (event.key) {
        case "ArrowUp":
          scrollBy(-48);
          break;
        case "ArrowDown":
          scrollBy(48);
          break;
        case "PageUp":
          scrollBy(-viewport.clientHeight * 0.85);
          break;
        case "PageDown":
          scrollBy(viewport.clientHeight * 0.85);
          break;
        case "Home":
          viewport.scrollTo({ top: 0, behavior: "instant" });
          break;
        case "End":
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "instant",
          });
          break;
        case "ArrowLeft":
          if (!event.repeat) onPrevious?.();
          break;
        case "ArrowRight":
          if (!event.repeat) onNext?.();
          break;
      }
    };
    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [keyboardActive, courseNavigation, onPrevious, onNext]);

  return (
    <section className="lesson-reader" aria-label={eyebrow}>
      <div className="lesson-reading-area">
        <div className="lesson-scroll" ref={scroll} id={scrollId}>
          <div ref={content} className="lesson-content">
            <small>{eyebrow}</small>
            <h1 ref={heading} tabIndex={-1}>
              {title}
            </h1>
            {children}
          </div>
        </div>
        <div
          className={`lesson-scrollbar${maximum <= 1 ? " is-inactive" : ""}`}
        >
          <button
            aria-label="Scroll lesson up"
            disabled={position.top <= 1}
            onClick={() => scrollBy(-48)}
          >
            ▲
          </button>
          <div
            ref={track}
            className="lesson-scroll-track"
            role="scrollbar"
            tabIndex={maximum > 1 ? 0 : -1}
            aria-label="Lesson scroll position"
            aria-controls={scrollId}
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={Math.round(maximum)}
            aria-valuenow={Math.round(position.top)}
            aria-disabled={maximum <= 1}
            onPointerDown={(event) => {
              if (maximum <= 1) return;
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              const rect = event.currentTarget.getBoundingClientRect();
              const thumbTop =
                rect.top + ((rect.height * (100 - thumbSize)) / 100) * progress;
              scrollBy(
                (event.clientY < thumbTop ? -1 : 1) * position.height * 0.85,
              );
            }}
          >
            <div
              className="lesson-scroll-thumb"
              aria-hidden="true"
              style={{
                height: `${Math.min(100, thumbSize)}%`,
                top: `${(100 - thumbSize) * progress}%`,
              }}
              onPointerDown={(event) => {
                if (maximum <= 1) return;
                event.preventDefault();
                event.stopPropagation();
                track.current?.focus({ preventScroll: true });
                drag.current = { y: event.clientY, top: position.top };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!drag.current || !track.current || !scroll.current) return;
                const travel =
                  track.current.getBoundingClientRect().height *
                  (1 - thumbSize / 100);
                if (travel > 0)
                  scroll.current.scrollTop =
                    drag.current.top +
                    ((event.clientY - drag.current.y) / travel) * maximum;
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onLostPointerCapture={() => {
                drag.current = null;
              }}
            >
              ≡
            </div>
          </div>
          <button
            aria-label="Scroll lesson down"
            disabled={position.top >= maximum - 1}
            onClick={() => scrollBy(48)}
          >
            ▼
          </button>
        </div>
      </div>
      <div className="lesson-reading-status">
        <span>
          ↑↓ Scroll{courseNavigation ? " · ←→ Pages" : ""} · PgUp/PgDn
        </span>
        <span>
          {maximum <= 1
            ? "All text visible"
            : position.top < maximum - 1
              ? "▼ More to read"
              : "■ End of page"}
        </span>
      </div>
      <nav className="lesson-navigation" aria-label="Lesson navigation">
        {actions}
      </nav>
    </section>
  );
}
