class Node {
  constructor() {
    this.children = new Map();
    this.terminal = false;
  }
}

export class Trie {
  constructor() { this.root = new Node(); }
  insert(word) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) node.children.set(char, new Node());
      node = node.children.get(char);
    }
    node.terminal = true;
  }
  suggestions(prefix, limit = 8) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      node = node.children.get(char);
      if (!node) return [];
    }
    const result = [];
    const visit = (current, value) => {
      if (result.length >= limit) return;
      if (current.terminal) result.push(value);
      for (const [char, child] of current.children) visit(child, value + char);
    };
    visit(node, prefix.toLowerCase());
    return result;
  }
}
