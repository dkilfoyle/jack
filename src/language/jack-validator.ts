import type { ValidationAcceptor, ValidationChecks } from "langium";
import { isExpression, isReturnStatement, type ClassDec, type JackAstType } from "./generated/ast.js";
import type { JackServices } from "./jack-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: JackServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.JackValidator;
  const checks: ValidationChecks<JackAstType> = {
    ClassDec: [validator.checkClassNameStartsWithCapital, validator.checkValidClassConstructor],
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

      if (constructorMethod.statements.length == 0)
        accept("error", "Class constructor must end with 'return this;'", { node: constructorMethod, property: "statements" });
      else {
        const lastStatement = constructorMethod.statements[constructorMethod.statements.length - 1];
        if (!isReturnStatement(lastStatement)) {
          accept("error", "Class constructor must end with 'return this;'", { node: lastStatement, property: "expression" });
        } else {
          if (
            !(isExpression(lastStatement.expression) && lastStatement.expression.$cstNode && lastStatement.expression.$cstNode.text == "this")
          )
            accept("error", "Class constructor must end with 'return this;'", { node: lastStatement, property: "expression" });
        }
      }
    }
  }
}
