import { AstNode, DefaultWorkspaceManager, LangiumDocument, LangiumDocumentFactory } from "langium";
import { WorkspaceFolder } from "vscode-languageserver";
import { URI } from "vscode-uri";
import { type LangiumSharedServices } from "langium/lsp";
import { arrayBuiltin } from "./builtins/Array.js";
import { keyboardBuiltin } from "./builtins/Keyboard.js";
import { mathBuiltin } from "./builtins/Math.js";
import { memoryBuiltin } from "./builtins/Memory.js";
import { outputBuiltin } from "./builtins/Output.js";
import { screenBuiltin } from "./builtins/Screen.js";
import { stringBuiltin } from "./builtins/String.js";
import { sysBuiltin } from "./builtins/Sys.js";

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
    collector(this.documentFactory.fromString(arrayBuiltin, URI.parse("builtin:///Array.jack")));
    collector(this.documentFactory.fromString(keyboardBuiltin, URI.parse("builtin:///Keyboard.jack")));
    collector(this.documentFactory.fromString(mathBuiltin, URI.parse("builtin:///Math.jack")));
    collector(this.documentFactory.fromString(memoryBuiltin, URI.parse("builtin:///Memory.jack")));
    collector(this.documentFactory.fromString(outputBuiltin, URI.parse("builtin:///Output.jack")));
    collector(this.documentFactory.fromString(screenBuiltin, URI.parse("builtin:///Screen.jack")));
    collector(this.documentFactory.fromString(stringBuiltin, URI.parse("builtin:///String.jack")));
    collector(this.documentFactory.fromString(sysBuiltin, URI.parse("builtin:///Sys.jack")));
  }
}
