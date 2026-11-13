import { searchableText, tokenize } from './TextProcessor.js';

export class InvertedIndex {
  constructor() {
    this.postings = new Map();
    this.documents = new Map();
  }

  add(resource) {
    this.remove(resource._id);
    this.documents.set(String(resource._id), resource);
    for (const token of tokenize(searchableText(resource))) {
      if (!this.postings.has(token)) this.postings.set(token, new Set());
      this.postings.get(token).add(String(resource._id));
    }
  }

  remove(id) {
    const key = String(id);
    for (const ids of this.postings.values()) ids.delete(key);
    for (const [token, ids] of this.postings) if (!ids.size) this.postings.delete(token);
    this.documents.delete(key);
  }

  lookup(tokens) {
    const sets = tokens.map((token) => this.postings.get(token) || new Set());
    return new Set(sets.flatMap((set) => [...set]));
  }

  vocabulary() {
    return [...this.postings.keys()];
  }
}
