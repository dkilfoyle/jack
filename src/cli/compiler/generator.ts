import {
  DoStatement,
  Expression,
  IfStatement,
  isBinaryExpression,
  isBooleanConstant,
  isClassDec,
  isDoStatement,
  isIfStatement,
  isLetStatement,
  isNamedFeature,
  isNullConstant,
  isNumberConstant,
  isReturnStatement,
  isStringConstant,
  isSubroutineDec,
  isThisConstant,
  isUnaryExpression,
  isVarName,
  isWhileStatement,
  LetStatement,
  NamedFeature,
  Program,
  ReturnStatement,
  Statement,
  SubroutineDec,
  VarName,
  WhileStatement,
  type ClassDec,
} from "../../language/generated/ast.js";
import { CompositeGeneratorNode, expandToNode, joinToNode, toString } from "langium/generate";
import * as fs from "node:fs";
import * as path from "node:path";
import { extractDestinationAndName } from "../cli-util.js";
import { inferType } from "../../language/type-system/infer.js";
import { charCodes } from "./charCodes.js";
// import _ from "lodash";

interface ClassSymbolTableEntry {
  name: string;
  type: string;
  kind: "this" | "static";
  num: number;
}

interface methodSymbolTableEntry {
  name: string;
  type: string;
  kind: "argument" | "local";
  num: number;
}

const classSymbolTable: ClassSymbolTableEntry[] = [];
const methodSymbolTable: methodSymbolTableEntry[] = [];

function getSymbol(name: string) {
  let s = methodSymbolTable.find((s) => s.name == name) || classSymbolTable.find((s) => s.name == name);
  if (s) return `${s.kind} ${s.num} // ${s.name}`;
  console.error("Get Symbol not found", name);
  throw Error("get symbol not found");
}

let labelCount = 0;

function buildClassSymbolTable(classDec: ClassDec) {
  classSymbolTable.length = 0;
  classDec.fieldClassVarDec.forEach((fcvd, i) =>
    fcvd.varNames.forEach((vn, j) => {
      if (isVarName(vn))
        classSymbolTable.push({
          name: vn.name,
          type: inferType(fcvd, new Map()).$type,
          kind: "this",
          num: i + j,
        });
    })
  );
  classDec.staticClassVarDec.forEach((vd, i) =>
    vd.varNames.forEach((vn, j) => {
      if (isVarName(vn))
        classSymbolTable.push({
          name: vn.name,
          type: inferType(vd, new Map()).$type,
          kind: "static",
          num: i + j,
        });
    })
  );
}

function buildMethodSymbolTable(subroutineDec: SubroutineDec) {
  methodSymbolTable.length = 0;
  if (subroutineDec.decType == "function") {
    console.log("function symbol table same as method symbol table??");
  }
  if (subroutineDec.decType == "method" && isClassDec(subroutineDec.$container))
    methodSymbolTable.push({
      name: "this",
      type: subroutineDec.$container.name,
      kind: "argument",
      num: 0,
    }); // no this for constructors or functions
  subroutineDec.parameters.forEach((p) => {
    methodSymbolTable.push({
      name: p.name,
      type: inferType(p.type, new Map()).$type,
      kind: "argument",
      num: methodSymbolTable.length,
    });
  });
  subroutineDec.varDec.forEach((vd, i) => {
    vd.varNames.forEach((vn, j) => {
      if (isVarName(vn))
        methodSymbolTable.push({
          name: vn.name,
          type: inferType(vn, new Map()).$type,
          kind: "local",
          num: i + j,
        });
    });
  });
}

function compileClass(classDec: ClassDec) {
  // build class level symbol table
  buildClassSymbolTable(classDec);

  return expandToNode`
    // Class ${classDec.name}
    // Class level symbol table
    ${joinToNode(classSymbolTable.map((e) => `// ${e.name}:${e.type} - ${e.kind} [${e.num}]`))}
    ${joinToNode(classDec.subroutineDec.map((s) => compileMethod(s)))}
  `;
}

function getSubroutineName(subroutineDec: SubroutineDec) {
  return `${(subroutineDec.$container as ClassDec).name}.${subroutineDec.name}`;
}

function printMethodSymbolTable(name: string) {
  return expandToNode`
  // Method ${name} Symbol Table
  ${joinToNode(
    methodSymbolTable.map((e) => `// ${e.name}:${e.type} - ${e.kind} [${e.num}]`),
    { appendNewLineIfNotEmpty: true }
  )}`;
}

function compileMethod(subroutineDec: SubroutineDec) {
  buildMethodSymbolTable(subroutineDec);
  if (!isClassDec(subroutineDec.$container)) throw Error();
  if (subroutineDec.decType == "constructor")
    return expandToNode`
      function ${getSubroutineName(subroutineDec)} ${methodSymbolTable.filter((s) => s.kind == "local").length}
        ${printMethodSymbolTable(getSubroutineName(subroutineDec))}
        push constant ${classSymbolTable.filter((s) => s.kind == "this").length}
        call Memory.alloc 1
        pop pointer 0
        // body
        ${compileStatements(subroutineDec.statements)}
    `;
  else
    return expandToNode`
      function ${getSubroutineName(subroutineDec)} ${methodSymbolTable.filter((s) => s.kind == "local").length}
        ${printMethodSymbolTable(getSubroutineName(subroutineDec))}
        ${compileStatements(subroutineDec.statements)}
      `;
}

function compileStatements(statements: Statement[]) {
  return joinToNode(
    statements.map((s) => {
      if (isLetStatement(s)) return compileLetStatement(s);
      if (isWhileStatement(s)) return compileWhileStatement(s);
      if (isIfStatement(s)) return compileIfStatement(s);
      if (isDoStatement(s)) return compileDoStatement(s);
      if (isReturnStatement(s)) return compileReturnStatement(s);
      throw Error("Unimplemented statement type");
    }),
    { appendNewLineIfNotEmpty: true }
  );
}

function compileLetStatement(letStatement: LetStatement) {
  // if (letStatement.lhsIndexExpression) {
  //   return expandToNode`
  //     // ${letStatement.$cstNode?.text}
  //     ${compileExpression(letStatement.lhs)}
  //     ${compileExpression(letStatement.lhsIndexExpression)}
  //     add
  //     ${compileExpression(letStatement.rhsExpression)}
  //     pop pointer 1 // THAT = address rhs
  //     push that 0   // stack top = rhs
  //     pop temp 0    // temp - = rhs
  //     pop pointer 1 // THAT = address lhs
  //     push temp 0   // stack top = rhs
  //     pop that 0    // lhs = rhs
  //     `;
  // } else
  //   return expandToNode`
  //   // ${letStatement.$cstNode?.text}
  //   ${compileExpression(letStatement.rhsExpression)}
  //   pop ${getSymbol(letStatement.lhs.$cstNode!.text)}
  //   `;
  return expandToNode`// TODO let statment and array indexing`;
}

function compileWhileStatement(whileStatement: WhileStatement): CompositeGeneratorNode {
  const label = `LWHILE${labelCount++}`;
  return expandToNode`
  label ${label}
    ${compileExpression(whileStatement.testExpression)}
    not
    if-goto ${label}_END
    ${compileStatements(whileStatement.statements)}
    goto ${label}
  label ${label}_END`;
}
function compileIfStatement(ifStatement: IfStatement): CompositeGeneratorNode {
  const label = `LIF${labelCount++}`;
  return expandToNode`
    // if (${ifStatement.testExpression.$cstNode?.text})
    ${compileExpression(ifStatement.testExpression)}
    not
    if-goto ${label}_ELSE
    ${compileStatements(ifStatement.statements)}
    goto ${label}_END
    label ${label}_ELSE
      ${compileStatements(ifStatement.elseStatements)}
    label ${label}_END  
  `;
}
function compileDoStatement(doStatement: DoStatement) {
  return expandToNode`
    ${compileExpression(doStatement.subroutineCall)}
    pop temp 0`;
}
function compileReturnStatement(returnStatement: ReturnStatement) {
  return expandToNode`
  ${returnStatement.expression ? compileExpression(returnStatement.expression) : "push constant 0"}
  return`;
}

const binaryOperatorNames: Record<string, string> = {
  "+": "add",
  "-": "sub",
  "*": "call Math.multiply 2",
  "/": "call Math.divider 2",
};

const unaryOperatorNames: Record<string, string> = {
  "-": "neg",
};

function compileExpression(expression: Expression): CompositeGeneratorNode {
  if (isBinaryExpression(expression)) {
    return expandToNode`
    ${compileExpression(expression.left)}
    ${compileExpression(expression.right)}
    ${binaryOperatorNames[expression.operator]}
    `;
  }
  if (isUnaryExpression(expression)) {
    return expandToNode`
    ${compileExpression(expression.value)}
    ${unaryOperatorNames[expression.operator]}
    `;
  }
  if (isBooleanConstant(expression)) {
    if (expression.value)
      return expandToNode`
      push constant 1
      neg`;
    else
      return expandToNode`
      push constant 0`;
  }
  if (isNumberConstant(expression)) {
    return expandToNode`
    push constant ${expression.value}`;
  }
  if (isThisConstant(expression)) {
    return expandToNode`push pointer 0`;
  }
  if (isNullConstant(expression)) {
    return expandToNode`push constant 0`;
  }
  if (isNamedFeature(expression)) {
    return compileNamedFeature(expression);
  }
  // if (isVariable(expression)) {
  //   return compileVariable(expression);
  // }
  if (isStringConstant(expression)) {
    return expandToNode`
    // "${expression.value}"
    push constant ${expression.value.length}
    call String.new 1
    ${joinToNode(
      expression.value.split("").map(
        (c) => expandToNode`
      push constant ${charCodes[c]}
      call String.appendChar 1
    `
      )
    )}
    `;
  }

  console.error("Unimplemented expression", expression);
  throw Error("Unimplemented expression");
}

function compileNamedFeature(feature: NamedFeature) {
  if (isVarName(feature.element.ref)) {
    // a or a.method()
    const subroutineDec = feature.calledSubroutine?.ref;
    if (isSubroutineDec(subroutineDec)) {
      // a.method
      return compileMethodCall(feature.element.ref.name, subroutineDec.name, feature.arguments);
    } else {
      // a
      return compileVariable(feature.element.ref);
    }
  } else if (isSubroutineDec(feature.element.ref)) {
    // a()
    return compileMethodCall("this", feature.element.ref.name, feature.arguments);
  } else if (isClassDec(feature.element.ref)) {
    // Class.a()
    const subroutineDec = feature.calledSubroutine?.ref;
    if (isSubroutineDec(subroutineDec)) {
      if (subroutineDec.decType == "constructor")
        return compileConstructorCall(feature.element.ref.name, subroutineDec.name, feature.arguments);
      else return compileFunctionCall(feature.element.ref.name, subroutineDec.name, feature.arguments);
    } else throw Error();
  } else {
    throw Error();
  }

  // if (memberCall.explicitIndex) {
  //   if (!isVarName(namedElement)) {
  //     console.error("indexing a namedElement which is not a varName", namedElement);
  //     throw Error();
  //   }
  //   return expandToNode`
  //     // ${memberCall.$cstNode?.text}
  //     push ${getSymbol(namedElement.name)}
  //     ${compileExpression(memberCall.indexExpression!)}
  //     add
  //     `;
  // }
}

function compileVariable(variable: VarName) {
  // TODO: implement array indexing
  return expandToNode`
        // TODO: implement array index
        push ${getSymbol(variable.name)}`;
}

function compileConstructorCall(className: string, methodName: string, parameters: Expression[]) {
  return expandToNode`
    // ${className}.${methodName}(${parameters.map((p) => p.$cstNode?.text).join(", ")})
    ${joinToNode(parameters.map((p) => compileExpression(p)))}
    call ${methodName} ${parameters.length}`;
}

function compileMethodCall(objectName: string, methodName: string, parameters: Expression[]) {
  return expandToNode`
    // ${objectName}.${methodName}(${parameters.map((p) => p.$cstNode?.text).join(", ")})
    push ${getSymbol(objectName)}
    pop pointer 0
    ${joinToNode(parameters.map((p) => compileExpression(p)))}
    call ${methodName} ${parameters.length + 1}`;
}

function compileFunctionCall(className: string, methodName: string, parameters: Expression[]) {
  return expandToNode`
    // ${className}.${methodName}(${parameters.map((p) => p.$cstNode?.text).join(", ")})
    // TODO: ? handling of this
    ${joinToNode(parameters.map((p) => compileExpression(p)))}
    call ${className}.${methodName} ${parameters.length}`;
}

export function generateHackVM(program: Program, filePath: string, destination: string | undefined): string {
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

  labelCount = 0;
  const programNode = expandToNode`
    // File ${destination}
    ${compileClass(program.class)}
  `;

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }
  fs.writeFileSync(generatedFilePath, toString(programNode));
  return generatedFilePath;
}
