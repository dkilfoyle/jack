import { AstNode, DefaultWorkspaceManager, LangiumDocument, LangiumDocumentFactory } from "langium";
import { WorkspaceFolder } from "vscode-languageserver";
import { URI } from "vscode-uri";
import { type LangiumSharedServices } from "langium/lsp";
import os from "./builtins/index.js";

export class JackWorkspaceManager extends DefaultWorkspaceManager {
  private documentFactory: LangiumDocumentFactory;

  constructor(services: LangiumSharedServices) {
    super(services);
    this.documentFactory = services.workspace.LangiumDocumentFactory;
  }

  protected override async loadAdditionalDocuments(
    folders: WorkspaceFolder[],
    collector: (document: LangiumDocument<AstNode>) => void
  ): Promise<void> {
    await super.loadAdditionalDocuments(folders, collector);
    // Load our library using the `builtin` URI schema

    Object.entries(os).forEach(([uri, text]) => collector(this.documentFactory.fromString(text, URI.parse(uri))));
  }
}
