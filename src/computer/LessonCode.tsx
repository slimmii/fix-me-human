import { tsxLanguage, typescriptLanguage } from "@codemirror/lang-javascript";
import { highlightTree, tagHighlighter, tags } from "@lezer/highlight";
import { useMemo, type ReactNode } from "react";
import type { Components } from "react-markdown";

const highlighter = tagHighlighter([
  { tag: tags.keyword, class: "lesson-token-keyword" },
  { tag: [tags.string, tags.attributeValue], class: "lesson-token-string" },
  { tag: [tags.tagName, tags.typeName], class: "lesson-token-type" },
  { tag: [tags.number, tags.bool, tags.null], class: "lesson-token-number" },
  { tag: tags.comment, class: "lesson-token-comment" },
]);

export const LessonCode: Components["code"] = ({
  children,
  className,
  node: _node,
  ...props
}) => {
  const language = /(?:^|\s)language-(ts|tsx|typescript)(?=\s|$)/.exec(
    className ?? "",
  )?.[1];
  const highlighted = useMemo(() => {
    if (!language || typeof children !== "string") return children;
    const parser = language === "tsx" ? tsxLanguage : typescriptLanguage;
    const parts: ReactNode[] = [];
    let position = 0;
    highlightTree(
      parser.parser.parse(children),
      highlighter,
      (from, to, token) => {
        if (from > position) parts.push(children.slice(position, from));
        parts.push(
          <span key={from} className={token}>
            {children.slice(from, to)}
          </span>,
        );
        position = to;
      },
    );
    parts.push(children.slice(position));
    return parts;
  }, [children, language]);

  return (
    <code className={className} {...props}>
      {highlighted}
    </code>
  );
};
