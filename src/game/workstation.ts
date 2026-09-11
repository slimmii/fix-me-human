export function createWorkstationId(): string {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const number = String(1 + Math.floor(Math.random() * 999)).padStart(3, "0");
  return `${letter}–${number}`;
}

export function decodeWorkstationId(value: unknown): string | null {
  return typeof value === "string" &&
    /^[A-Z]–\d{3}$/.test(value) &&
    !value.endsWith("000")
    ? value
    : null;
}
