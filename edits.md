1. Add documentChangeNotification to main-browser so that worker will send a notification with serialized AST after every document change

```
startLanguageServer(shared);

// Send a notification with the serialized AST after every document change
type DocumentChange = { uri: string; content: string; diagnostics: Diagnostic[] };
const documentChangeNotification = new NotificationType<DocumentChange>("browser/DocumentChange");
const jsonSerializer = Hdl.serializer.JsonSerializer;
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
```

2. Add documentChange listener to wrapper in setupClass.js

```
const client = wrapper.getLanguageClient();
if (!client) throw new Error("Unable to obtain language client")
client.onNotification("browser/DocumentChange", (resp:any) => console.log(resp));
```

