import { AstNode, AstUtils, type ValidationAcceptor, type ValidationChecks } from "langium";
import {
  BinaryExpression,
  isClassDec,
  isMemberCall,
  isReturnStatement,
  isSubroutineDec,
  LetStatement,
  MemberCall,
  SubroutineDec,
  UnaryExpression,
  type ClassDec,
  type JackAstType,
} from "./generated/ast.js";
import type { JackServices } from "./jack-module.js";
import { inferType } from "./type-system/infer.js";
import { isAssignable } from "./type-system/assignments.js";
import { isLegalOperation } from "./type-system/operator.js";
import { isErrorType, TypeDescription, typeToString } from "./type-system/descriptions.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: JackServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.JackValidator;
  const checks: ValidationChecks<JackAstType> = {
    ClassDec: [validator.checkClassNameStartsWithCapital, validator.checkValidClassConstructor],
    MemberCall: validator.checkValidMemberCall,
    SubroutineDec: [validator.checkSubroutineEndsWithReturn, validator.checkSubroutineReturnsCorrectType],
    BinaryExpression: validator.checkBinaryOperationAllowed,
    UnaryExpression: validator.checkUnaryOperationAllowed,
    LetStatement: validator.checkVariableAssignmentAllowed,
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class JackValidator {
  // checkMethodNamesAreUnique
  // checkMemberCallHasCorrectArguments
  // type conversions
  // char = int | char
  // Array = Array | int | Object
  // Object = Object | Array

  checkValidCharValue(subroutineDec: SubroutineDec, accept: ValidationAcceptor): void {}

  checkSubroutineReturnsCorrectType(subroutineDec: SubroutineDec, accept: ValidationAcceptor): void {
    const map = this.getTypeCache();
    const returnStatements = subroutineDec.statements.filter(isReturnStatement);
    const expectedType = inferType(subroutineDec.returnType, map);

    for (const returnStatement of returnStatements) {
      const returnValueType = inferType(returnStatement, map);
      if (!isAssignable(returnValueType, expectedType)) {
        accept("error", `Type '${returnValueType}' is not assignable to type '${expectedType}'.`, {
          node: returnStatement,
        });
      }
    }
  }

  checkVariableAssignmentAllowed(decl: LetStatement, accept: ValidationAcceptor): void {
    if (decl.varName && decl.rhsExpression) {
      const map = this.getTypeCache();
      const left = inferType(decl.varName.ref, map);
      const right = inferType(decl.rhsExpression, map);
      if (!(isErrorType(right) || isErrorType(left)) && !isAssignable(right, left)) {
        accept("error", `Type '${typeToString(right)}' is not assignable to type '${typeToString(left)}'.`, {
          node: decl,
          property: "rhsExpression",
        });
      }
    }
  }

  checkUnaryOperationAllowed(unary: UnaryExpression, accept: ValidationAcceptor): void {
    const item = inferType(unary.value, this.getTypeCache());
    if (!isLegalOperation(unary.operator, item)) {
      accept("error", `Cannot perform operation '${unary.operator}' on value of type '${typeToString(item)}'.`, {
        node: unary,
      });
    }
  }

  checkBinaryOperationAllowed(binary: BinaryExpression, accept: ValidationAcceptor): void {
    const map = this.getTypeCache();
    const left = inferType(binary.left, map);
    const right = inferType(binary.right, map);
    // console.log("binary operator", left, right);
    if (!isLegalOperation(binary.operator, left, right)) {
      console.log(binary);
      accept("error", `Cannot perform operation '${binary.operator}' on values of type '${typeToString(left)}' and '${typeToString(right)}'.`, {
        node: binary,
      });
    } else if (["==", "!="].includes(binary.operator)) {
      if (!isAssignable(right, left)) {
        accept(
          "warning",
          `This comparison will always return '${
            binary.operator === "==" ? "false" : "true"
          }' as types '${left}' and '${right}' are not compatible.`,
          {
            node: binary,
            property: "operator",
          }
        );
      }
    }
  }

  checkClassNameStartsWithCapital(classDec: ClassDec, accept: ValidationAcceptor): void {
    if (classDec.name) {
      const firstChar = classDec.name.substring(0, 1);
      if (firstChar.toUpperCase() !== firstChar) {
        accept("warning", "Class name should start with a capital.", { node: classDec, property: "name" });
      }
    }
  }
  checkValidClassConstructor(classDec: ClassDec, accept: ValidationAcceptor): void {
    const constructorMethod = classDec.subroutineDec.find((srd) => srd.decType == "constructor");
    if (constructorMethod) {
      if (
        !constructorMethod.returnType ||
        !constructorMethod.returnType.$cstNode ||
        constructorMethod.returnType.$cstNode.text != classDec.name
      )
        accept("error", `Class '${classDec.name}' constructor must return type of ${classDec.name}`, {
          node: constructorMethod,
          property: "returnType",
        });

      if (!constructorMethod.name || constructorMethod.name != "new")
        accept("error", `Class constructor must have name 'new'`, { node: constructorMethod, property: "name" });

      if (constructorMethod.statements.length > 0) {
        const lastStatement = constructorMethod.statements[constructorMethod.statements.length - 1];
        if (isReturnStatement(lastStatement)) {
          if (lastStatement.expression?.$cstNode?.text != "this")
            accept("error", "Class constructor must end with 'return this;'", { node: lastStatement, property: "expression" });
        }
      }
    }
  }
  checkValidMemberCall(memberCall: MemberCall, accept: ValidationAcceptor): void {
    // console.log("memberCall", memberCall);
    if (memberCall.element?.ref) {
      // cannot call local method from static function
      // function int caller() { do localMethod() } == NO but {do myObject.method() } == OK
      if (isSubroutineDec(memberCall.element.ref) && !isMemberCall(memberCall.previous)) {
        const caller = AstUtils.getContainerOfType(memberCall, isSubroutineDec);
        if (caller?.decType == "function")
          accept("error", "Cannot call own class method from static function", { node: memberCall, property: "element" });
      }

      // cannot call method from Class
      // Array.dispose() = NO (dispose is a method)
      if (isSubroutineDec(memberCall.element.ref) && isMemberCall(memberCall.previous) && isClassDec(memberCall.previous?.element?.ref)) {
        const subroutineDec = memberCall.element.ref;
        if (subroutineDec.decType == "method")
          accept("error", "Cannot use static call for method function", { node: memberCall, property: "element" });
      }
    }
  }

  checkSubroutineEndsWithReturn(subroutineDec: SubroutineDec, accept: ValidationAcceptor): void {
    if (subroutineDec.statements.length == 0 || !isReturnStatement(subroutineDec.statements[subroutineDec.statements.length - 1]))
      accept("error", "Missing return statement", { node: subroutineDec, keyword: "}" });
  }

  private getTypeCache(): Map<AstNode, TypeDescription> {
    return new Map();
  }
}
