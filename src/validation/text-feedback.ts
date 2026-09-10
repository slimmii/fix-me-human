export const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

const withoutPunctuation = (text: string) => text.replace(/\p{P}/gu, "");
const quote = (text: string) => `“${text || "(empty)"}”`;

export function textMismatchFeedback(
  expected: string,
  actual: string[],
  location = "the page",
): string {
  expected = normalizeText(expected);
  const candidates = [...new Set(actual.map(normalizeText))];
  const punctuationMatch = candidates.find(
    (text) => withoutPunctuation(text) === withoutPunctuation(expected),
  );
  const caseMatch = candidates.find(
    (text) => text.toLowerCase() === expected.toLowerCase(),
  );
  const combinedMatch = candidates.find(
    (text) =>
      withoutPunctuation(text).toLowerCase() ===
      withoutPunctuation(expected).toLowerCase(),
  );
  // A column can contain both its task count and its empty-state message.
  // Prefer the wording near-match so the tip identifies the relevant text.
  const nearMatch = punctuationMatch ?? caseMatch ?? combinedMatch;
  const found =
    nearMatch !== undefined
      ? quote(nearMatch)
      : candidates.length
        ? candidates.slice(0, 3).map(quote).join(" or ") +
          (candidates.length > 3 ? " (among other text)" : "")
        : "no visible matching element";
  const tip =
    punctuationMatch !== undefined
      ? "Check the punctuation; it must match exactly."
      : caseMatch !== undefined
        ? "Check the capital letters; they must match exactly."
        : "Match the wording, capital letters and punctuation; extra whitespace is ignored.";
  return `In ${location}, I expected ${quote(expected)}, but found ${found}. ${tip}`;
}
