import React, { useEffect, useState } from "react";
import Splitter, { SplitDirection } from "@devbookhq/splitter";
import ReactJson from "@microlink/react-json-view";
import { JackMonaco } from "./components/JackMonaco";
import "./App.css";

function App() {
  const [jackAST, setJackAST] = useState({});
  return (
    <Splitter direction={SplitDirection.Horizontal}>
      <JackMonaco onChange={(doc) => setJackAST(JSON.parse(doc.content))}></JackMonaco>
      <div>
        <h2>VM Code here</h2>
      </div>
      <ReactJson
        src={jackAST}
        collapseStringsAfterLength={20}
        collapsed={3}
        indentWidth={2}
        enableClipboard={false}
        shouldCollapse={(field) => ["$textRegion"].includes(field.name || "")}
        style={{ height: "100%", overflow: "auto", fontSize: 10 }}></ReactJson>
    </Splitter>
  );
}

export default App;
