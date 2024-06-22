import { AstNode } from "langium";
import {
  BinaryExpression,
  isBinaryExpression,
  isBooleanExpression,
  isClassDec,
  isSubroutineDec,
  isMemberCall,
  isNilExpression,
  isNumberExpression,
  isParameter,
  isReturnStatement,
  isStringExpression,
  isUnaryExpression,
  isVarDec,
  MemberCall,
  VarTypeRef,
  ReturnTypeRef,
  isReturnTypeRef,
  isVarTypeRef,
  isVarName,
} from "../generated/ast.js";
import {
  createBooleanType,
  createClassType,
  createErrorType,
  createFunctionType,
  createMethodType,
  createNilType,
  createNumberType,
  createStringType,
  createVoidType,
  isFunctionType,
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
  if (isStringExpression(node)) {
    type = createStringType(node);
  } else if (isNumberExpression(node)) {
    type = createNumberType(node);
  } else if (isBooleanExpression(node)) {
    type = createBooleanType(node);
  } else if (isNilExpression(node)) {
    type = createNilType();
  } else if (isSubroutineDec(node)) {
    const returnType = inferType(node.returnType, cache);
    const parameters = node.parameters.map((e) => ({
      name: e.name,
      type: inferType(e.type, cache),
    }));
    type = node.decType == "function" ? createFunctionType(returnType, parameters) : createMethodType(returnType, parameters);
  } else if (isVarTypeRef(node) || isReturnTypeRef(node)) {
    type = inferTypeRef(node, cache);
  } else if (isMemberCall(node)) {
    type = inferMemberCall(node, cache);
    if (node.explicitOperationCall) {
      if (isFunctionType(type)) {
        type = type.returnType;
      }
    }
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
      return createStringType();
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

function inferMemberCall(node: MemberCall, cache: Map<AstNode, TypeDescription>): TypeDescription {
  const element = node.element?.ref;
  if (element) {
    return inferType(element, cache);
  } else if (node.explicitOperationCall && node.previous) {
    const previousType = inferType(node.previous, cache);
    if (isFunctionType(previousType)) {
      return previousType.returnType;
    }
    return createErrorType("Cannot call operation on non-function type", node);
  }
  return createErrorType("Could not infer type for element " + node.element?.$refText ?? "undefined", node);
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

// export function getClassChain(classItem: ClassDec): ClassDec[] {
//   const set = new Set<ClassDec>();
//   let value: ClassDec | undefined = classItem;
//   while (value && !set.has(value)) {
//     set.add(value);
//     value = value.superClass?.ref;
//   }
//   // Sets preserve insertion order
//   return Array.from(set);
// }
