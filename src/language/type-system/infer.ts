import { AstNode } from "langium";
import {
  BinaryExpression,
  isBinaryExpression,
  isBooleanConstant,
  isClassDec,
  isSubroutineDec,
  isNullConstant,
  isNumberConstant,
  isParameter,
  isReturnStatement,
  isStringConstant,
  isUnaryExpression,
  isVarDec,
  VarTypeRef,
  ReturnTypeRef,
  isReturnTypeRef,
  isVarTypeRef,
  isVarName,
  isNamedFeature,
  NamedFeature,
} from "../generated/ast.js";
import {
  // createAnyType,
  createBooleanType,
  createCharType,
  createClassType,
  createErrorType,
  createNullType,
  createNumberType,
  createStringType,
  createVoidType,
  // isFunctionType,
  // isMethodType,
  isStringType,
  TypeDescription,
} from "./descriptions.js";

export function inferType(node: AstNode | undefined, cache: Map<AstNode, TypeDescription>): TypeDescription {
  let type: TypeDescription | undefined;
  if (!node) {
    return createErrorType("Could not infer type for undefined", node);
  }
  const existing = cache.get(node);
  if (existing) {
    return existing;
  }
  // Prevent recursive inference errors
  cache.set(node, createErrorType("Recursive definition", node));
  if (isStringConstant(node)) {
    type = createStringType(node);
  } else if (isNumberConstant(node)) {
    type = createNumberType(node);
  } else if (isBooleanConstant(node)) {
    type = createBooleanType(node);
  } else if (isNullConstant(node)) {
    type = createNullType();
  } else if (isVarTypeRef(node) || isReturnTypeRef(node)) {
    type = inferTypeRef(node, cache);
  } else if (isNamedFeature(node)) {
    type = inferNamedFeature(node, cache);
  } else if (isVarDec(node)) {
    type = inferType(node.type, cache);
  } else if (isVarName(node)) {
    type = inferType(node.$container, cache);
  } else if (isParameter(node)) {
    type = inferType(node.type, cache);
  } else if (isSubroutineDec(node)) {
    type = inferType(node.returnType, cache);
  } else if (isClassDec(node)) {
    type = createClassType(node);
  } else if (isBinaryExpression(node)) {
    type = inferBinaryExpression(node, cache);
  } else if (isUnaryExpression(node)) {
    if (node.operator === "!") {
      type = createBooleanType();
    } else {
      type = createNumberType();
    }
  } else if (isReturnStatement(node)) {
    if (!node.expression) {
      type = createVoidType();
    } else {
      type = inferType(node.expression, cache);
    }
  }
  if (!type) {
    type = createErrorType("Could not infer type for " + node.$type, node);
  }

  cache.set(node, type);
  return type;
}

function inferTypeRef(node: VarTypeRef | ReturnTypeRef, cache: Map<AstNode, TypeDescription>): TypeDescription {
  if (node.primitive) {
    if (node.primitive === "int") {
      return createNumberType();
    } else if (node.primitive === "char") {
      return createCharType();
    } else if (node.primitive === "boolean") {
      return createBooleanType();
    } else if (node.primitive === "void") {
      return createVoidType();
    }
  } else if (node.reference) {
    if (node.reference.ref) {
      return createClassType(node.reference.ref);
    }
  }
  return createErrorType("Could not infer type for this reference", node);
}

function inferNamedFeature(node: NamedFeature, cache: Map<AstNode, TypeDescription>): TypeDescription {
  // console.log("memberCall", node);
  const element = node.element?.ref;
  if (isClassDec(element)) {
    // Class.function
    const func = node.calledSubroutine?.ref;
    if (isSubroutineDec(func)) {
      return inferType(func, cache);
    } else return createErrorType("Expecting static function after class", node);
  } else if (isSubroutineDec(element)) {
    // mymethod()
    if (node.calledSubroutine) return createErrorType("Cannot chain subroutines", node); // cant do mymethod().something()
    return inferType(node.calledSubroutine, cache);
  } else if (isVarName(element)) {
    // a or a.method
    if (node.calledSubroutine) {
      return inferType(node.calledSubroutine.ref, cache);
    } else return inferType(element, cache);
  }
  return createErrorType("Could not infer type for element " + node.$cstNode?.text || "undefined", node);
}

function inferBinaryExpression(expr: BinaryExpression, cache: Map<AstNode, TypeDescription>): TypeDescription {
  if (["-", "*", "/", "%"].includes(expr.operator)) {
    return createNumberType();
  } else if (["and", "or", "<", "<=", ">", ">=", "==", "!="].includes(expr.operator)) {
    return createBooleanType();
  }
  const left = inferType(expr.left, cache);
  const right = inferType(expr.right, cache);
  if (expr.operator === "+") {
    if (isStringType(left) || isStringType(right)) {
      return createStringType();
    } else {
      return createNumberType();
    }
  }
  return createErrorType("Could not infer type from binary expression", expr);
}
