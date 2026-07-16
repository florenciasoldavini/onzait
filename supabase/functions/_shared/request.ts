export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getTrimmedString(
  value: unknown,
  property: string,
): string {
  if (!isRecord(value)) {
    return "";
  }

  const candidate = value[property];
  return typeof candidate === "string" ? candidate.trim() : "";
}
