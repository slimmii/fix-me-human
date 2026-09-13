import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import { describe, expect, it } from "vitest";
import { LessonCode } from "../src/computer/LessonCode";

const render = (source: string) =>
  renderToStaticMarkup(
    createElement(Markdown, {
      components: { code: LessonCode },
      children: source,
    }),
  );

describe("teaching material syntax highlighting", () => {
  it.each(["ts", "typescript"])(
    "highlights %s type annotations",
    (language) => {
      const html = render(
        `\`\`\`${language}\nconst count: number = 3;\n\`\`\``,
      );
      expect(html).toContain('<span class="lesson-token-keyword">const</span>');
      expect(html).toContain('<span class="lesson-token-type">number</span>');
      expect(html).toContain('<span class="lesson-token-number">3</span>');
    },
  );

  it("highlights TSX tags and preserves whitespace and escaped text", () => {
    const source =
      'export default function App() {\n  return <h1 title="Hello">A & B</h1>;\n}\n';
    const html = render(`\`\`\`tsx\n${source}\`\`\``);
    expect(html).toContain('<span class="lesson-token-type">h1</span>');
    expect(html).toContain('class="lesson-token-string"');
    expect(html.replace(/<[^>]*>/g, "")).toBe(
      source
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;"),
    );
  });

  it("keeps inline code and unsupported code blocks as plain text", () => {
    expect(
      render("`const x = 1`\n\n```text\n<h1>Hello</h1>\n```"),
    ).not.toContain("lesson-token-");
    expect(render("```\nconst x = 1\n```")).not.toContain("lesson-token-");
  });
});
