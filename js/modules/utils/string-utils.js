class StringUtils {
  constructor() {}

  formatString(str, ...args) {
    return str.replace(/{(\d+)}/g, (match, index) => {
      return args[index] !== undefined ? args[index] : match;
    });
  }

  validateEmail(email) {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    return emailRegex.test(email);
  }

  truncateString(str, length, suffix = '...') {
    if (!str || str.length <= length) {
      return str;
    }
    return str.substring(0, length - suffix.length) + suffix;
  }

  capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  camelCase(str) {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^./, str => str.toLowerCase());
  }

  kebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  snakeCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  titleCase(str) {
    return str
      .split(/\s+/)
      .map(word => this.capitalize(word))
      .join(' ');
  }

  removeWhitespace(str) {
    return str.replace(/\s+/g, '');
  }

  padLeft(str, length, char = ' ') {
    return str.padStart(length, char);
  }

  padRight(str, length, char = ' ') {
    return str.padEnd(length, char);
  }

  isEmpty(str) {
    return !str || str.trim() === '';
  }

  contains(str, substring) {
    return str.toLowerCase().includes(substring.toLowerCase());
  }

  startsWith(str, prefix) {
    return str.toLowerCase().startsWith(prefix.toLowerCase());
  }

  endsWith(str, suffix) {
    return str.toLowerCase().endsWith(suffix.toLowerCase());
  }

  replaceAll(str, find, replace) {
    return str.split(find).join(replace);
  }

  countOccurrences(str, substring) {
    return (str.match(new RegExp(substring, 'g')) || []).length;
  }

  extractNumbers(str) {
    return str.replace(/[^0-9]/g, '');
  }

  extractLetters(str) {
    return str.replace(/[^a-zA-Z]/g, '');
  }

  generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  unescapeHtml(str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.textContent;
  }

  normalizeWhitespace(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

  getInitials(str) {
    return str
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  isPalindrome(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  similarity(str1, str2) {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return (maxLength - distance) / maxLength;
  }
}

const stringUtils = new StringUtils();
export default stringUtils;