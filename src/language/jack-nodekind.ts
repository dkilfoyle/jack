import { AstNode, AstNodeDescription, isAstNodeDescription } from "langium";
import { type NodeKindProvider } from "langium/lsp";
import { CompletionItemKind, SymbolKind } from "vscode-languageserver";
import { inferType } from "./type-system/infer.js";
import { isFunctionType, isMethodType } from "./type-system/descriptions.js";
import { isClassDec, isFieldClassVarDec, isStaticClassVarDec, isVarDec, isVarName } from "./generated/ast.js";

export class JackNodeKindProvider implements NodeKindProvider {
  getSymbolKind(node: AstNode | AstNodeDescription): SymbolKind {
    console.log("get symbol kind", node);
    return SymbolKind.Field;
  }
  getCompletionItemKind(node: AstNode | AstNodeDescription): CompletionItemKind {
    const n = isAstNodeDescription(node) && node.node ? node.node : (node as AstNode);
    const inferredType = inferType(n, new Map());
    switch (true) {
      case isFunctionType(inferredType):
        return CompletionItemKind.Function;
      case isMethodType(inferredType):
        return CompletionItemKind.Method;
      case isVarDec(n):
        return CompletionItemKind.Variable;
      case isFieldClassVarDec(n):
        return CompletionItemKind.Field;
      case isStaticClassVarDec(n):
        return CompletionItemKind.Property;
      case isClassDec(n):
        return CompletionItemKind.Class;
      case isVarName(n):
        return CompletionItemKind.Variable;
      case n.$type == "keyword":
        return CompletionItemKind.Keyword;
      default:
        console.log("Unimplemented nodekind ", n);
    }
    return CompletionItemKind.Reference;
  }
}
