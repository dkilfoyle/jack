// import { AstNode } from "langium";
// import {
//   BinaryExpression,
//   FieldClassVarDec,
//   isBinaryExpression,
//   isBooleanExpression,
//   isFieldClassVarDec,
//   isMemberCall,
//   isNullExpression,
//   isNumberExpression,
//   isParameter,
//   isReturnStatement,
//   isReturnTypeRef,
//   isStaticClassVarDec,
//   isStringExpression,
//   isSubroutineDec,
//   isUnaryExpression,
//   isVarDec,
//   isVarName,
//   isVarTypeRef,
//   MemberCall,
//   Parameter,
//   ReturnStatement,
//   ReturnTypeRef,
//   StaticClassVarDec,
//   SubroutineDec,
//   UnaryExpression,
//   VarDec,
//   VarName,
//   VarTypeRef,
// } from "./generated/ast.js";

// export function inferType(node: AstNode, cache: Map<AstNode, string>): string {
//   let type: string | undefined;
//   if (!node) {
//     throw Error();
//   }
//   const existing = cache.get(node);
//   if (existing) {
//     return existing;
//   }
//   // Prevent recursive inference errors
//   cache.set(node, "Recursive definition");

//   switch (true) {
//     case isStringExpression(node):
//       type = "string";
//       break;
//     case isNumberExpression(node):
//       type = "int";
//       break;
//     case isBooleanExpression(node):
//       type = "boolean";
//       break;
//     case isNullExpression(node):
//       type = "null";
//       break;
//     case isVarTypeRef(node):
//       type = inferTypeRef(node as VarTypeRef, cache);
//     case isReturnTypeRef(node): {
//       type = inferTypeRef(node as ReturnTypeRef, cache);
//       break;
//     }
//     case isMemberCall(node):
//       type = inferMemberCall(node as MemberCall, cache);
//       break;

//     case isVarDec(node):
//       type = inferType((node as VarDec).type, cache);
//       break;
//     case isFieldClassVarDec(node):
//       type = inferType((node as FieldClassVarDec).type, cache);
//       break;
//     case isStaticClassVarDec(node):
//       type = inferType((node as StaticClassVarDec).type, cache);
//       break;
//     case isVarName(node):
//       type = inferType((node as VarName).$container, cache);
//       break;
//     case isParameter(node):
//       type = inferType((node as Parameter).type, cache);
//       break;
//     case isSubroutineDec(node):
//       type = inferType((node as SubroutineDec).returnType, cache);
//       break;
//     case isBinaryExpression(node):
//       type = inferBinaryExpression(node as BinaryExpression, cache);
//       break;
//     case isUnaryExpression(node):
//       type = (node as UnaryExpression).operator === "!" ? "boolean" : "int";
//       break;
//     case isReturnStatement(node):
//       type = (node as ReturnStatement).expression ? inferType((node as ReturnStatement).expression!, cache) : "void";
//       break;
//     default:
//       throw Error("Unable to infer node of " + node.$type);
//   }

//   // else if (isVarTypeRef(node) || isReturnTypeRef(node)) {
//   //   type = inferTypeRef(node, cache);
//   // } else if (isMemberCall(node)) {
//   //   type = inferMemberCall(node, cache);
//   //   if (node.explicitOperationCall) {
//   //     if (isFunctionType(type)) {
//   //       type = type.returnType;
//   //     }
//   //   }
//   if (!type) throw Error("infer type undefined");

//   cache.set(node, type);
//   return type;
// }

// function inferTypeRef(node: VarTypeRef | ReturnTypeRef, cache: Map<AstNode, string>): string {
//   if (node.primitive) {
//     if (node.primitive === "int") {
//       return "int";
//     } else if (node.primitive === "char") {
//       return "char";
//     } else if (node.primitive === "boolean") {
//       return "boolean";
//     } else if (node.primitive === "void") {
//       return "void";
//     }
//   } else if (node.reference) {
//     if (node.reference.ref) {
//       return node.reference.ref.name;
//     }
//   }

//   throw Error("Unable to infer type ref " + node.$type);
// }

// function inferMemberCall(node: MemberCall, cache: Map<AstNode, string>): string {
//   const element = node.element?.ref;
//   if (element) {
//     return inferType(element, cache);
//   } else {
//     console.log("inferMemberCall with no element ref", node);
//     debugger;
//     return "unknown";
//   }
// }

// function inferBinaryExpression(expr: BinaryExpression, cache: Map<AstNode, string>): string {
//   if (["-", "*", "/", "%"].includes(expr.operator)) {
//     return "int";
//   } else if (["and", "or", "<", "<=", ">", ">=", "==", "!="].includes(expr.operator)) {
//     return "boolean";
//   }
//   const left = inferType(expr.left, cache);
//   const right = inferType(expr.right, cache);
//   if (expr.operator === "+") {
//     if (left == "string" || right == "string") {
//       return "string";
//     } else {
//       return "int";
//     }
//   }
//   throw Error("Unable to infer type of binary expression");
// }

// export function isPrimitive(mytype: string): boolean {
//   return ["int", "char", "boolean", "void"].includes(mytype);
// }

// export function isClassObject(mytype: string): boolean {
//   return !isPrimitive(mytype);
// }

// export function isAssignable(from: string, to: string): boolean {
//   // cannot assign null to primitive
//   // let x:int = null
//   if (from == "null") {
//     return isClassObject(to);
//   }

//   // char's are assigned as char c = 45
//   if (to == "char") {
//     return from == "int";
//   }

//   // can assign int to object
//   if (from == "int" && isClassObject(to)) return true;

//   return from === to;
// }

// export function isLegalOperation(operator: string, left: string, right?: string): boolean {
//   if (operator === "+") {
//     if (!right) {
//       return left === "int";
//     }
//     return left === "int" && right === "int";
//   } else if (["-", "/", "*", "%", "<", "<=", ">", ">="].includes(operator)) {
//     if (!right) {
//       return left === "int";
//     }
//     return left === "int" && right === "int";
//   } else if (["and", "or"].includes(operator)) {
//     return left === "boolean" && right === "boolean";
//   } else if (operator === "!") {
//     return left === "boolean";
//   }
//   return true;
// }
