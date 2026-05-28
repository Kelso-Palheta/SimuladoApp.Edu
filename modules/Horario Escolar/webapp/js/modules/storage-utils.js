/**
 * Storage Utilities
 * Helper functions for sessionStorage/localStorage
 */

class StorageUtils {
  static saveTemp(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  static loadTemp(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static clearTemp(key) {
    sessionStorage.removeItem(key);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageUtils;
}
