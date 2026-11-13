const DEFAULT_STOP_WORDS = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'the', 'to', 'with']);

export function tokenize(value, stopWords = DEFAULT_STOP_WORDS) {
  return [...new Set(
    String(value || '')
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter((token) => token && !stopWords.has(token))
  )];
}

export function searchableText(resource) {
  return [
    resource.title, resource.description, resource.category, resource.resourceType,
    resource.department, resource.subject, resource.academicYear,
    ...(resource.tags || [])
  ].filter(Boolean).join(' ');
}
