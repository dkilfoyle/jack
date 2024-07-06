import { DefaultScopeProvider, EMPTY_SCOPE, ReferenceInfo, Scope } from "langium";
import { JackServices } from "./jack-module.js";
import { ClassDec, isClassDec, isNamedFeature, isVarName } from "./generated/ast.js";

export class JackScopeProvider extends DefaultScopeProvider {
  constructor(services: JackServices) {
    super(services);
  }

  override getScope(context: ReferenceInfo): Scope {
    // target element of member calls
    if (context.property === "calledSubroutine" && isNamedFeature(context.container)) {
      const feature = context.container;
      const element = feature.element.ref;

      if (isClassDec(element)) {
        // eg Math.min()
        return this.scopeStaticClassMembers(element);
      } else if (isVarName(element)) {
        // eg myobject.mymethod()
        const varDec = element.$container;
        const varType = varDec.type.reference?.ref;
        if (varType) return this.scopeObjectClassMembers(varType);
      } else {
        // console.error("Unable to scope context", context);
        return EMPTY_SCOPE;
      }
    }
    return super.getScope(context);
  }

  private scopeStaticClassMembers(classItem: ClassDec): Scope {
    const allFunctions = classItem.subroutineDec.filter((srd) => srd.decType == "function");
    // const allStaticVars = classItem.staticClassVarDec; // NO - actually these are private members
    return this.createScopeForNodes(allFunctions);
  }
  private scopeObjectClassMembers(classItem: ClassDec): Scope {
    const allMethods = classItem.subroutineDec.filter((srd) => srd.decType == "method" || srd.decType == "constructor");
    // const allFieldVars = classItem.fieldClassVarDec; // NO - actually these are private member
    return this.createScopeForNodes(allMethods);
  }
}
