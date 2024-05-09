type TestResult = {
  ignored: boolean;
  unignored: boolean;
};

class IgnoreRule {
  origin: string;
  pattern: string;
  negative: boolean;
  regex: RegExp;

  constructor(origin: string, pattern: string, negative: boolean, regex: RegExp) {
    this.origin = origin;
    this.pattern = pattern;
    this.negative = negative;
    this.regex = regex;
  }
}

class Ignore {
  private _rules: IgnoreRule[] = [];
  private _ignoreCase: boolean;
  private _allowRelativePaths: boolean;
  private _ignoreCache: { [key: string]: TestResult } = {};
  private _testCache: { [key: string]: TestResult } = {};

  constructor(options: { ignoreCase?: boolean; allowRelativePaths?: boolean } = {}) {
    const { ignoreCase = true, allowRelativePaths = false } = options;
    this._ignoreCase = ignoreCase;
    this._allowRelativePaths = allowRelativePaths;
  }

  private _addPattern(pattern: string | Ignore): void {
    if (pattern instanceof Ignore) {
      this._rules = this._rules.concat(pattern._rules);
      return;
    }

    if (typeof pattern === 'string' && this.checkPattern(pattern)) {
      const rule = this.createRule(pattern, this._ignoreCase);
      this._rules.push(rule);
    }
  }

  add(patterns: string | string[] | Ignore): Ignore {
    const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
    patternsArray.forEach(pattern => this._addPattern(pattern));
    return this;
  }

  private checkPattern(pattern: string): boolean {
    return !!pattern && !/^\s*$/.test(pattern) && !/(?:[^\\]|^)\\$/.test(pattern) && !pattern.startsWith('#');
  }

  private createRule(pattern: string, ignoreCase: boolean): IgnoreRule {
    const origin = pattern;
    const negative = pattern.startsWith('!');
    if (negative) {
      pattern = pattern.substring(1);
    }
    pattern = pattern.replace(/^\\!/, '!').replace(/^\\#/, '#');
    const regex = new RegExp(this.sanitizePattern(pattern), ignoreCase ? 'i' : '');
    return new IgnoreRule(origin, pattern, negative, regex);
  }

  private sanitizePattern(pattern: string): string {
    // Sanitization logic here
    return pattern.replace(/[\*\.]/g, match => `\\${match}`);
  }

  ignores(path: string): boolean {
    return this.test(path).ignored;
  }

  test(path: string): TestResult {
    const result = this._testOne(path);
    this._testCache[path] = result;
    return result;
  }

  private _testOne(path: string): TestResult {
    let ignored = false;
    let unignored = false;
    this._rules.forEach(rule => {
      const match = rule.regex.test(path);
      if (match) {
        if (rule.negative) {
          unignored = true;
        } else {
          ignored = true;
        }
      }
    });
    return { ignored, unignored };
  }

  createFilter(): (path: string) => boolean {
    return path => !this.ignores(path);
  }
}

export default Ignore;