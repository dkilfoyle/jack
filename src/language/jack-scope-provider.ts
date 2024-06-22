import { DefaultScopeProvider, EMPTY_SCOPE, ReferenceInfo, Scope } from "langium";
import { JackServices } from "./jack-module.js";
import { ClassDec, MemberCall } from "./generated/ast.js";
import { inferType } from "./type-system/infer.js";
import { isClassType } from "./type-system/descriptions.js";

export class JackScopeProvider extends DefaultScopeProvider {
  constructor(services: JackServices) {
    super(services);
  }

  override getScope(context: ReferenceInfo): Scope {
    // target element of member calls
    if (context.property === "element") {
      const memberCall = context.container as MemberCall;
      const previous = memberCall.previous;
      if (!previous) {
        return super.getScope(context);
      }
      const previousType = inferType(previous, new Map());
      if (isClassType(previousType)) {
        return this.scopeClassMembers(previousType.literal);
      }
      return EMPTY_SCOPE;
    }
    return super.getScope(context);
  }

  private scopeClassMembers(classItem: ClassDec): Scope {
    const allMembers = classItem.subroutineDec;
    return this.createScopeForNodes(allMembers);
  }
}
