import { LangiumDocument, MaybePromise } from "langium";
import { CodeActionProvider } from "langium/lsp";
import { CodeActionParams, CancellationToken, Command, CodeAction, WorkspaceEdit, TextEdit } from "vscode-languageserver";

export class JackCodeActionProvider implements CodeActionProvider {
  getCodeActions(
    document: LangiumDocument,
    params: CodeActionParams,
    cancelToken?: CancellationToken
  ): MaybePromise<Array<Command | CodeAction> | undefined> {
    // console.log("Action provider", params, document);
    const actions: CodeAction[] = [];
    params.context.diagnostics.forEach((diagnostic) => {
      if (diagnostic.message == "Missing return statement") {
        const edit: WorkspaceEdit = {
          changes: { [document.uri.toString()]: [TextEdit.insert(diagnostic.range.start, "return void")] },
        };
        actions.push(CodeAction.create("Add return", edit, "quickfix"));
      }
    });
    return actions;
  }
}
