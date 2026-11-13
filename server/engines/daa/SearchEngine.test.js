import test from 'node:test';
import assert from 'node:assert/strict';
import { SearchEngine } from './SearchEngine.js';
import { tokenize } from './TextProcessor.js';
import { Trie } from './Trie.js';

const resources = [
  { _id: '1', title: 'DBMS Notes', description: 'Third semester database notes', category: 'academic', tags: ['dbms'] },
  { _id: '2', title: 'Placement Drive', description: 'Software placement opportunity', category: 'placement', tags: ['jobs'] }
];

test('normalizes and deduplicates tokens', () => assert.deepEqual(tokenize('DBMS, notes and notes'), ['dbms', 'notes']));
test('searches through the inverted index and ranks title matches', () => {
  const engine = new SearchEngine();
  resources.forEach((resource) => engine.add(resource));
  assert.equal(engine.search('dbms notes')[0].resource._id, '1');
  assert.deepEqual(engine.suggest('place'), ['placement']);
});
test('trie returns prefix matches', () => {
  const trie = new Trie(); trie.insert('placement'); trie.insert('place');
  assert.deepEqual(trie.suggestions('plac'), ['place', 'placement']);
});
