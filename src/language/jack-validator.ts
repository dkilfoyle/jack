import type { ValidationChecks } from "langium";
import type { JackAstType } from "./generated/ast.js";
import type { JackServices } from "./jack-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: JackServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.JackValidator;
  const checks: ValidationChecks<JackAstType> = {
    // Person: validator.checkPersonStartsWithCapital
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class JackValidator {
  // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
  //     if (person.name) {
  //         const firstChar = person.name.substring(0, 1);
  //         if (firstChar.toUpperCase() !== firstChar) {
  //             accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
  //         }
  //     }
  // }
}
