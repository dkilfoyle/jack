import { DefaultScopeProvider, EMPTY_SCOPE, ReferenceInfo, Scope } from "langium";
import { JackServices } from "./jack-module.js";
import { ClassDec, isClassDec, isMemberCall, isVarName } from "./generated/ast.js";

export class JackScopeProvider extends DefaultScopeProvider {
  constructor(services: JackServices) {
    super(services);
  }

  override getScope(context: ReferenceInfo): Scope {
    // target element of member calls
    if (context.property === "element" && isMemberCall(context.container)) {
      const memberCall = context.container;
      // eg Math.min()
      // memberCall = min
      // previous = Math
      if (!memberCall.previous) {
        return super.getScope(context);
      }

      if (isMemberCall(memberCall.previous)) {
        const previousNamedElement = memberCall.previous.element?.ref;
        if (previousNamedElement) {
          if (isClassDec(previousNamedElement)) return this.scopeStaticClassMembers(previousNamedElement);
          else if (isVarName(previousNamedElement)) {
            const varDec = previousNamedElement.$container;
            const varType = varDec.type.reference?.ref;
            if (varType) return this.scopeObjectClassMembers(varType);
          } else {
            console.error("Unable to scope previousNamedElement");
          }
        } else {
          // why? no previousNamedElement
          throw Error();
        }
      }

      return EMPTY_SCOPE;
    }
    return super.getScope(context);
  }

  private scopeStaticClassMembers(classItem: ClassDec): Scope {
    const allFunctions = classItem.subroutineDec.filter((srd) => srd.decType == "function");
    const allStaticVars = classItem.staticClassVarDec;
    return this.createScopeForNodes([...allStaticVars, ...allFunctions]);
  }
  private scopeObjectClassMembers(classItem: ClassDec): Scope {
    const allMethods = classItem.subroutineDec.filter((srd) => srd.decType == "method" || srd.decType == "constructor");
    const allFieldVars = classItem.fieldClassVarDec;
    return this.createScopeForNodes([...allFieldVars, ...allMethods]);
  }
}
