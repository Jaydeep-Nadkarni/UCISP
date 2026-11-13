import { tokenize, searchableText } from './TextProcessor.js';
import { rank } from './RankingEngine.js';
import { Trie } from './Trie.js';
import { InvertedIndex } from './InvertedIndex.js';

export class SearchEngine {
  constructor() { this.index = new InvertedIndex(); this.trie = new Trie(); }
  add(resource) {
    this.index.add(resource);
    for (const token of tokenize(searchableText(resource))) this.trie.insert(token);
  }
  remove(id) { this.index.remove(id); }
  search(query, filters = {}) {
    const terms = tokenize(query);
    const candidates = terms.length ? this.index.lookup(terms) : new Set(this.index.documents.keys());
    const results = [...candidates]
      .map((id) => this.index.documents.get(id))
      .filter(Boolean)
      .filter((resource) => terms.every((term) => searchableText(resource).toLowerCase().includes(term)))
      .filter((resource) => Object.entries(filters).every(([key, value]) => !value || String(resource[key] || '') === String(value)))
      .map((resource) => ({ resource, score: rank(resource, query, filters) }))
      .sort((a, b) => b.score - a.score || String(a.resource.title).localeCompare(String(b.resource.title)));
    return results;
  }
  suggest(prefix, limit) { return this.trie.suggestions(prefix, limit); }
}
