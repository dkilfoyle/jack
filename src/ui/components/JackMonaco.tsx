import React, { useEffect } from "react";
import { executeExtended } from "../../../static/setupExtended";

export function JackMonaco({ onChange }) {
  // const onMonacoLoad = (wrapper: MonacoEditorLanguageClientWrapper) => {
  //   const editor = wrapper.getEditor();
  //   if (!editor) {
  //     throw new Error("Unable to get a reference to the Monaco Editor");
  //   }

  //   // verify we can get a ref to the language client
  //   const lc = wrapper.getLanguageClient();
  //   if (!lc) {
  //     throw new Error("Could not get handle to Language Client on mount");
  //   }

  //   // register to receive DocumentChange notifications
  //   lc.onNotification("browser/DocumentChange", onDocumentChange);
  // };

  useEffect(() => {
    const startingPromise = executeExtended(document.getElementById("monaco-editor-root"), onChange);
  }, []);

  return <div id="monaco-editor-root"></div>;
}
