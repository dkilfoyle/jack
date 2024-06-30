import { arrayBuiltin } from "./Array.js";
import { keyboardBuiltin } from "./Keyboard.js";
import { mathBuiltin } from "./Math.js";
import { memoryBuiltin } from "./Memory.js";
import { outputBuiltin } from "./Output.js";
import { screenBuiltin } from "./Screen.js";
import { stringBuiltin } from "./String.js";
import { sysBuiltin } from "./Sys.js";

export default {
  "builtin:///Array.jack": arrayBuiltin,
  "builtin:///Keyboard.jack": keyboardBuiltin,
  "builtin:///Math.jack": mathBuiltin,
  "builtin:///Memory.jack": memoryBuiltin,
  "builtin:///Output.jack": outputBuiltin,
  "builtin:///Screen.jack": screenBuiltin,
  "builtin:///String.jack": stringBuiltin,
  "builtin:///Sys.jack": sysBuiltin,
};
