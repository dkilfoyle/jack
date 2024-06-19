import { addMonacoStyles, defineUserServices, MonacoEditorLanguageClientWrapper } from "./bundle/index.js";
import monarchSyntax from "../syntaxes/jack.monarch.js";
import { configureWorker } from "./setup.js";

addMonacoStyles("monaco-editor-styles");

const code = `// Jack is running in the web!
class Main {
  function void main() {
    var int i,j;
    let i = 1;
	  let j = i+2;
  }
}
`;

export const setupConfigClassic = () => {
  return {
    wrapperConfig: {
      serviceConfig: defineUserServices(),
      editorAppConfig: {
        $type: "classic",
        languageId: "jack",
        code,
        useDiffEditor: false,
        languageExtensionConfig: { id: "langium" },
        languageDef: monarchSyntax,
        editorOptions: {
          "semanticHighlighting.enabled": true,
          theme: "vs-dark",
        },
      },
    },
    languageClientConfig: configureWorker(),
  };
};

export const executeClassic = async (htmlElement, onChange) => {
  const userConfig = setupConfigClassic();
  const wrapper = new MonacoEditorLanguageClientWrapper();
  await wrapper.initAndStart(userConfig, htmlElement);
  const client = wrapper.getLanguageClient();
  //   console.log("Wrapper", wrapper);
  //   console.log("Client", client);
  if (!client) throw new Error("Unable to obtain language client");
  client.onNotification("browser/DocumentChange", onChange);
};
