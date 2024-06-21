import {
  AstNodeDescriptionProvider,
  AstUtils,
  EMPTY_SCOPE,
  LangiumCoreServices,
  MapScope,
  type Module,
  ReferenceInfo,
  Scope,
  ScopeProvider,
  inject,
  AstNodeDescription,
} from "langium";
import {
  createDefaultModule,
  createDefaultSharedModule,
  type DefaultSharedModuleContext,
  type LangiumServices,
  type LangiumSharedServices,
  type PartialLangiumServices,
} from "langium/lsp";
import { JackGeneratedModule, JackGeneratedSharedModule } from "./generated/module.js";
import { JackValidator, registerValidationChecks } from "./jack-validator.js";
import { isExpression, isLetStatement, isSubroutineDec } from "./generated/ast.js";
import { JackScopeComputation } from "./jack-scope.js";

export class JackScopeProvider implements ScopeProvider {
  private astNodeDescriptionProvider: AstNodeDescriptionProvider;
  constructor(services: LangiumCoreServices) {
    //get some helper services
    this.astNodeDescriptionProvider = services.workspace.AstNodeDescriptionProvider;
  }
  getScope(context: ReferenceInfo): Scope {
    //make sure which cross-reference you are handling right now
    console.log("getScope Context", context);

    if (
      (isLetStatement(context.container) && context.property === "varName") ||
      (isExpression(context.container) && context.property == "element")
    ) {
      console.log("isLet");

      //get the root node of the document
      const subroutineDec = AstUtils.getContainerOfType(context.container, isSubroutineDec)!;
      //select all persons from this document
      const varDecs = subroutineDec.varDec;
      //transform them into node descriptions
      const descriptions: AstNodeDescription[] = [];
      varDecs.forEach((vd) => {
        vd.varNames.forEach((vn) => descriptions.push(this.astNodeDescriptionProvider.createDescription(vn, vn.name)));
      });
      //create the scope
      return new MapScope(descriptions);
    }

    // if (isMemberCall(context.container) && context.property == "element") {
    //   //Success! We are handling the cross-reference of a greeting to a person!
    //   console.log("isMemberCall", context);

    //   const getSubroutineDec = (node: AstNode | undefined) => {
    //     let item = node;
    //     while (item) {
    //       console.log("Checking", item);
    //       if (item.$type == "SubroutineDec") return item;
    //       item = item.$container;
    //     }
    //     return undefined;
    //   };

    //   const subroutineDec = getSubroutineDec(context.container) as SubroutineDec;
    //   // const subroutineDec = AstUtils.getContainerOfType(context.container, isSubroutineDec)!;
    //   console.log("subroutindec = ", subroutineDec);

    //   //get the root node of the document
    //   // const subroutineDec = AstUtils.getContainerOfType(context.container, isSubroutineDec)!;
    //   //select all persons from this document
    //   const varDecs = subroutineDec.varDec;
    //   console.log("subroutinedec", subroutineDec, varDecs);
    //   //transform them into node descriptions
    //   const descriptions: AstNodeDescription[] = [];
    //   varDecs.forEach((vd) => {
    //     vd.varNames.forEach((vn) => descriptions.push(this.astNodeDescriptionProvider.createDescription(vn, vn.name)));
    //   });
    //   //create the scope
    //   return new MapScope(descriptions);
    // }

    return EMPTY_SCOPE;
  }
}

/**
 * Declaration of custom services - add your own service classes here.
 */
export type JackAddedServices = {
  validation: {
    JackValidator: JackValidator;
  };
  references: {
    ScopeProvider: JackScopeProvider;
    ScopeComputation: JackScopeComputation;
  };
};

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type JackServices = LangiumServices & JackAddedServices;

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const JackModule: Module<JackServices, PartialLangiumServices & JackAddedServices> = {
  validation: {
    JackValidator: () => new JackValidator(),
  },
  references: {
    ScopeProvider: (services) => new JackScopeProvider(services),
    ScopeComputation: (services) => new JackScopeComputation(services),
  },
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createJackServices(context: DefaultSharedModuleContext): {
  shared: LangiumSharedServices;
  Jack: JackServices;
} {
  const shared = inject(createDefaultSharedModule(context), JackGeneratedSharedModule);
  const Jack = inject(createDefaultModule({ shared }), JackGeneratedModule, JackModule);
  shared.ServiceRegistry.register(Jack);
  registerValidationChecks(Jack);
  return { shared, Jack };
}
