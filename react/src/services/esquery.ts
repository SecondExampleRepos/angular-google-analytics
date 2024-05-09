import { traverse, VisitorKeys, VisitorOption, Syntax } from 'estraverse';
import { parse as esqueryParse, match as esqueryMatch } from 'esquery';

type ASTNode = {
  type: string;
  [key: string]: any;
};

interface QueryOptions {
  visitorKeys?: { [type: string]: string[] };
  fallback?: 'iteration' | ((node: ASTNode) => string[]);
}

class ASTQueryService {
  private ast: ASTNode;

  constructor(ast: ASTNode) {
    this.ast = ast;
  }

  /**
   * Query the AST using a selector string and return matching nodes.
   * @param selector The selector string to query the AST.
   * @param options Additional options for controlling the traversal.
   * @returns An array of AST nodes that match the selector.
   */
  query(selector: string, options?: QueryOptions): ASTNode[] {
    const parsedSelector = esqueryParse(selector);
    return esqueryMatch(this.ast, parsedSelector, options);
  }

  /**
   * Traverse the AST with a custom visitor.
   * @param visitor The visitor object that defines methods to be called for each node.
   */
  traverse(visitor: VisitorKeys): void {
    traverse(this.ast, {
      enter: visitor.enter,
      leave: visitor.leave,
      keys: visitor.keys,
      fallback: visitor.fallback || 'iteration'
    });
  }
}

export { ASTQueryService };