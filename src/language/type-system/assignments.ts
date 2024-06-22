import { isClassType, isNilType, TypeDescription } from "./descriptions.js";

export function isAssignable(from: TypeDescription, to: TypeDescription): boolean {
  if (isClassType(from)) {
    // var Array a; var int b; let a=b;
    if (!isClassType(to)) {
      return false;
    }

    // var Array a,b; let a=b;
    const fromClass = from.literal;
    const toClass = to.literal;
    return fromClass == toClass;
  }

  if (isNilType(from)) {
    return isClassType(to); // var Array a; let a = nil;
  }

  return from.$type === to.$type;
}
