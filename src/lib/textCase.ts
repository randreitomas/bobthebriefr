export function toSentenceCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return trimmed.charAt(0).toLocaleUpperCase() + trimmed.slice(1)
}

export function toSentenceCaseList(values: string[]): string[] {
  return values.map(toSentenceCase)
}
