import { addMonacoStyles, defineUserServices, MonacoEditorLanguageClientWrapper } from "./bundle/index.js";
import monarchSyntax from "../syntaxes/jack.monarch.js";
import { configureWorker } from "./setup.js";

addMonacoStyles("monaco-editor-styles");

const code = `// Inputs some numbers and computes their average
class Main {
   function void main() {
      var Array a; 
      do a.dispose();
      // var int length;
      // var int i, sum;

      // let length = Keyboard.readInt("How many numbers? ");
      // let a = Array.new(length); // constructs the array
     
      // let i = 0;
      // while (i < length) {
      //    let a[i] = Keyboard.readInt("Enter a number: ");
      //    let sum = sum + a[i];
      //    let i = i + 1;
      // }

      // do Output.printString("The average is ");
      // do Output.printInt(sum / length);
      // return;
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
