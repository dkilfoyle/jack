import { DocumentState, EmptyFileSystem } from "langium";
import { startLanguageServer } from "langium/lsp";
import { BrowserMessageReader, BrowserMessageWriter, Diagnostic, NotificationType, createConnection } from "vscode-languageserver/browser.js";
import { createJackServices } from "./jack-module.js";

declare const self: DedicatedWorkerGlobalScope;

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

const { shared, Jack } = createJackServices({ connection, ...EmptyFileSystem });

startLanguageServer(shared);

// Send a notification with the serialized AST after every document change
type DocumentChange = { uri: string; content: string; diagnostics: Diagnostic[] };
const documentChangeNotification = new NotificationType<DocumentChange>("browser/DocumentChange");
const jsonSerializer = Jack.serializer.JsonSerializer;
shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, (documents) => {
  for (const document of documents) {
    const json = jsonSerializer.serialize(document.parseResult.value, {
      sourceText: true,
      textRegions: true,
    });
    connection.sendNotification(documentChangeNotification, {
      uri: document.uri.toString(),
      content: json,
      diagnostics: document.diagnostics ?? [],
    });
  }
});
