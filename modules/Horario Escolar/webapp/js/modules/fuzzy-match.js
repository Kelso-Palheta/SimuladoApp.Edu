/**
 * Fuzzy Match Helper
 * Wrapper around fuse.js for professor/discipline matching
 */

class FuzzyMatcher {
  constructor(items, options = {}) {
    // fuse.js will be imported in DataMapper
    this.Fuse = window.Fuse; // Assumes fuse.js loaded globally
    this.items = items;
    this.options = {
      keys: options.searchKey || 'name',
      threshold: options.threshold || 0.15, // lower = stricter (0.15 = ~85% match)
      ...options
    };
    this.index = new this.Fuse(items, this.options);
  }

  search(query) {
    return this.index.search(query).map(result => ({
      ...result.item,
      score: result.score,
      match: 1 - result.score // Convert to match percentage
    }));
  }

  findBest(query, threshold = 0.85) {
    const results = this.search(query);
    return results.find(r => r.match >= threshold) || null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FuzzyMatcher;
}
