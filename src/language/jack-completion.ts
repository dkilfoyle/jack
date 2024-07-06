import { LangiumDocuments, MaybePromise } from "langium";
import { CompletionAcceptor, CompletionContext, DefaultCompletionProvider, LangiumServices, NextFeature } from "langium/lsp";
// import { isParameter, isSubroutineDec } from "./generated/ast.js";
// import { CompletionItemKind } from "vscode-languageserver";

export class JackCompletionProvider extends DefaultCompletionProvider {
  protected readonly documents: LangiumDocuments;
  constructor(services: LangiumServices) {
    super(services);
    this.documents = services.shared.workspace.LangiumDocuments;
  }
  protected override completionFor(context: CompletionContext, next: NextFeature, acceptor: CompletionAcceptor): MaybePromise<void> {
    console.log("completion for ", context, next, context.document.precomputedScopes);

    // if (isSubroutineDec(context.node) && isParameter(next.feature)) {
    //   acceptor(context, {
    //                 kind: CompletionItemKind.Field,
    //                 label: text,
    //                 insertText: text,
    //             });
    // }

    return super.completionFor(context, next, acceptor);
  }
}
