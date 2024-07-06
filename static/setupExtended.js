import { addMonacoStyles, defineUserServices, MonacoEditorLanguageClientWrapper } from "./bundle/index.js";
import { configureWorker } from "./setup.js";

addMonacoStyles("monaco-editor-styles");

const code = `// Inputs some numbers and computes their average
class Main {
   function void main() {
      var int a;
      let a = Math.min(1,2);
      do Output.printInt(1 + (2 * 3));
      return;
   }
}
`;

export const setupConfigExtended = () => {
  const extensionFilesOrContents = new Map();
  const languageConfigUrl = new URL("../language-configuration.json", window.location.href);
  const textmateConfigUrl = new URL("../syntaxes/jack.tmLanguage.json", window.location.href);
  extensionFilesOrContents.set("/language-configuration.json", languageConfigUrl);
  extensionFilesOrContents.set("/jack-grammar.json", textmateConfigUrl);

  return {
    wrapperConfig: {
      serviceConfig: defineUserServices(),
      editorAppConfig: {
        $type: "extended",
        languageId: "jack",
        code,
        useDiffEditor: false,
        extensions: [
          {
            config: {
              name: "jack-web",
              publisher: "generator-langium",
              version: "1.0.0",
              engines: {
                vscode: "*",
              },
              contributes: {
                languages: [
                  {
                    id: "jack",
                    extensions: [".jack"],
                    configuration: "./language-configuration.json",
                  },
                ],
                grammars: [
                  {
                    language: "jack",
                    scopeName: "source.jack",
                    path: "./jack-grammar.json",
                  },
                ],
              },
            },
            filesOrContents: extensionFilesOrContents,
          },
        ],
        userConfiguration: {
          json: JSON.stringify({
            "workbench.colorTheme": "Default Dark Modern",
            "editor.semanticHighlighting.enabled": true,
          }),
        },
      },
    },
    languageClientConfig: configureWorker(),
  };
};

export const executeExtended = async (htmlElement, onChange) => {
  const userConfig = setupConfigExtended();
  const wrapper = new MonacoEditorLanguageClientWrapper();
  await wrapper.initAndStart(userConfig, htmlElement);
  const client = wrapper.getLanguageClient();
  //   console.log("Wrapper", wrapper);
  //   console.log("Client", client);
  if (!client) throw new Error("Unable to obtain language client");
  client.onNotification("browser/DocumentChange", onChange);
};
