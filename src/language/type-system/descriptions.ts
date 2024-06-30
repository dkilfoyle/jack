import { AstNode } from "langium";
import { BooleanExpression, ClassDec, NumberExpression, StringExpression } from "../generated/ast.js";

export type TypeDescription =
  | NullTypeDescription
  | AnyTypeDescription
  | CharTypeDescription
  | VoidTypeDescription
  | BooleanTypeDescription
  | StringTypeDescription
  | NumberTypeDescription
  | FunctionTypeDescription
  | MethodTypeDescription
  | ClassTypeDescription
  | ErrorType;

export interface NullTypeDescription {
  readonly $type: "null";
}

export function createNullType(): NullTypeDescription {
  return {
    $type: "null",
  };
}

export function isNullType(item: TypeDescription): item is NullTypeDescription {
  return item.$type === "null";
}

export interface AnyTypeDescription {
  readonly $type: "any";
  readonly literal: AstNode;
}

export function createAnyType(node: AstNode): AnyTypeDescription {
  return {
    $type: "any",
    literal: node,
  };
}

export function isAnyType(item: TypeDescription): item is AnyTypeDescription {
  return item.$type === "any";
}

export interface VoidTypeDescription {
  readonly $type: "void";
}

export function createVoidType(): VoidTypeDescription {
  return {
    $type: "void",
  };
}

export function isVoidType(item: TypeDescription): item is VoidTypeDescription {
  return item.$type === "void";
}

export interface CharTypeDescription {
  readonly $type: "char";
}

export function createCharType(): CharTypeDescription {
  return {
    $type: "char",
  };
}

export function isCharType(item: TypeDescription): item is CharTypeDescription {
  return item.$type === "char";
}

export interface BooleanTypeDescription {
  readonly $type: "boolean";
  readonly literal?: BooleanExpression;
}

export function createBooleanType(literal?: BooleanExpression): BooleanTypeDescription {
  return {
    $type: "boolean",
    literal,
  };
}

export function isBooleanType(item: TypeDescription): item is BooleanTypeDescription {
  return item.$type === "boolean";
}

export interface StringTypeDescription {
  readonly $type: "string";
  readonly literal?: StringExpression;
}

export function createStringType(literal?: StringExpression): StringTypeDescription {
  return {
    $type: "string",
    literal,
  };
}

export function isStringType(item: TypeDescription): item is StringTypeDescription {
  return item.$type === "string";
}

export interface NumberTypeDescription {
  readonly $type: "number";
  readonly literal?: NumberExpression;
}

export function createNumberType(literal?: NumberExpression): NumberTypeDescription {
  return {
    $type: "number",
    literal,
  };
}

export function isNumberType(item: TypeDescription): item is NumberTypeDescription {
  return item.$type === "number";
}

export interface FunctionTypeDescription {
  readonly $type: "function";
  readonly returnType: TypeDescription;
  readonly parameters: FunctionParameter[];
}

export interface FunctionParameter {
  name: string;
  type: TypeDescription;
}

export function createFunctionType(returnType: TypeDescription, parameters: FunctionParameter[]): FunctionTypeDescription {
  return {
    $type: "function",
    parameters,
    returnType,
  };
}

export function isFunctionType(item: TypeDescription): item is FunctionTypeDescription {
  return item.$type === "function";
}

export interface MethodTypeDescription {
  readonly $type: "method";
  readonly returnType: TypeDescription;
  readonly parameters: FunctionParameter[];
}

export function createMethodType(returnType: TypeDescription, parameters: FunctionParameter[]): MethodTypeDescription {
  return {
    $type: "method",
    parameters,
    returnType,
  };
}

export function isMethodType(item: TypeDescription): item is MethodTypeDescription {
  return item.$type === "method";
}

export interface ClassTypeDescription {
  readonly $type: "class";
  readonly literal: ClassDec;
}

export function createClassType(literal: ClassDec): ClassTypeDescription {
  return {
    $type: "class",
    literal,
  };
}

export function isClassType(item: TypeDescription): item is ClassTypeDescription {
  return item.$type === "class";
}

export interface ErrorType {
  readonly $type: "error";
  readonly source?: AstNode;
  readonly message: string;
}

export function createErrorType(message: string, source?: AstNode): ErrorType {
  return {
    $type: "error",
    message,
    source,
  };
}

export function isErrorType(item: TypeDescription): item is ErrorType {
  return item.$type === "error";
}

export function typeToString(item: TypeDescription): string {
  if (isClassType(item)) {
    return item.literal.name;
  } else if (isFunctionType(item)) {
    const params = item.parameters.map((e) => `${e.name}: ${typeToString(e.type)}`).join(", ");
    return `(${params}) => ${typeToString(item.returnType)}`;
  } else {
    return item.$type;
  }
}
