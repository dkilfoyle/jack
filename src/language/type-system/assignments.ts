import { isCharType, isClassType, isNullType, isNumberType, TypeDescription } from "./descriptions.js";

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

  // var Array a;
  // let a = 1000;
  if (isClassType(to) && isNumberType(from)) return true;

  if (isNullType(from)) {
    return isClassType(to); // var Array a; let a = nil;
  }

  if (isCharType(to)) {
    return isNumberType(from);
  }

  // if (isErrorType(from)) console.log("Error from", from);
  // if (isErrorType(to)) console.log("Error to", to);

  return from.$type === to.$type;
}
