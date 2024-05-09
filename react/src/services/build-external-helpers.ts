import * as babelHelpers from "@babel/helpers";
import { generate } from "@babel/generator";
import template from "@babel/template";
import * as t from "@babel/types";
import file from "../transformation/file/file.js";

type OutputType = "global" | "module" | "umd" | "var";

class BabelHelperService {
  private buildHelpers(body: any[], namespace: t.Identifier | null, allowlist: string[]) {
    const getHelperReference = (name: string) => {
      return namespace ? t.memberExpression(namespace, t.identifier(name)) : t.identifier(`_${name}`);
    };

    const refs: { [key: string]: t.Identifier } = {};
    babelHelpers.list.forEach((name: string) => {
      if (allowlist && !allowlist.includes(name)) return;
      const ref = refs[name] = getHelperReference(name);
      babelHelpers.ensure(name, file.default);
      const { nodes } = babelHelpers.get(name, getHelperReference, ref);
      body.push(...nodes);
    });
    return refs;
  }

  private buildGlobal(allowlist: string[]) {
    const namespace = t.identifier("babelHelpers");
    const body: any[] = [];
    const container = t.functionExpression(null, [t.identifier("global")], t.blockStatement(body));
    const tree = t.program([t.expressionStatement(t.callExpression(container, [
      t.conditionalExpression(
        t.binaryExpression("===", t.unaryExpression("typeof", t.identifier("global")), t.stringLiteral("undefined")),
        t.identifier("self"),
        t.identifier("global")
      )
    ]))]);

    body.push(t.variableDeclaration("var", [t.variableDeclarator(namespace, t.assignmentExpression("=", t.memberExpression(t.identifier("global"), namespace), t.objectExpression([])))]));
    this.buildHelpers(body, namespace, allowlist);
    return tree;
  }

  private buildModule(allowlist: string[]) {
    const body: any[] = [];
    const refs = this.buildHelpers(body, null, allowlist);
    body.unshift(t.exportNamedDeclaration(null, Object.keys(refs).map(name => {
      return t.exportSpecifier(t.cloneNode(refs[name]), t.identifier(name));
    })));
    return t.program(body, [], "module");
  }

  private buildUmd(allowlist: string[]) {
    const namespace = t.identifier("babelHelpers");
    const body: any[] = [];
    body.push(t.variableDeclaration("var", [t.variableDeclarator(namespace, t.identifier("global"))]));
    this.buildHelpers(body, namespace, allowlist);
    return t.program([this.buildUmdWrapper({
      FACTORY_PARAMETERS: t.identifier("global"),
      BROWSER_ARGUMENTS: t.assignmentExpression("=", t.memberExpression(t.identifier("root"), namespace), t.objectExpression([])),
      COMMON_ARGUMENTS: t.identifier("exports"),
      AMD_ARGUMENTS: t.arrayExpression([t.stringLiteral("exports")]),
      FACTORY_BODY: body,
      UMD_ROOT: t.identifier("this")
    })]);
  }

  private buildVar(allowlist: string[]) {
    const namespace = t.identifier("babelHelpers");
    const body: any[] = [];
    body.push(t.variableDeclaration("var", [t.variableDeclarator(namespace, t.objectExpression([]))]));
    const tree = t.program(body);
    this.buildHelpers(body, namespace, allowlist);
    body.push(t.expressionStatement(namespace));
    return tree;
  }

  private buildUmdWrapper(replacements: any) {
    return template.statement`
      (function (root, factory) {
        if (typeof define === "function" && define.amd) {
          define(AMD_ARGUMENTS, factory);
        } else if (typeof exports === "object") {
          factory(COMMON_ARGUMENTS);
        } else {
          factory(BROWSER_ARGUMENTS);
        }
      })(UMD_ROOT, function (FACTORY_PARAMETERS) {
        FACTORY_BODY
      });
    `(replacements);
  }

  public generateHelpers(allowlist: string[], outputType: OutputType = "global"): string {
    let tree;
    const build = {
      global: this.buildGlobal,
      module: this.buildModule,
      umd: this.buildUmd,
      var: this.buildVar
    }[outputType];

    if (build) {
      tree = build.call(this, allowlist);
    } else {
      throw new Error(`Unsupported output type ${outputType}`);
    }
    return generate(tree).code;
  }
}

export default BabelHelperService;