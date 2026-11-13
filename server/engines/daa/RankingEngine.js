import { searchableText, tokenize } from './TextProcessor.js';

export function rank(resource, query, filters = {}) {
  const terms = tokenize(query);
  const title = String(resource.title || '').toLowerCase();
  const text = searchableText(resource).toLowerCase();
  let score = terms.reduce((total, term) => total + (title.includes(term) ? 25 : 0) + (text.includes(term) ? 10 : 0), 0);
  if (filters.category && resource.category === filters.category) score += 15;
  if (filters.department && resource.department === filters.department) score += 10;
  if (filters.subject && resource.subject === filters.subject) score += 10;
  return score;
}
