import type { AstNode, AstNodeDescription, LangiumDocument, PrecomputedScopes } from "langium";
import { AstUtils, Cancellation, DefaultScopeComputation, interruptAndCheck, MultiMap } from "langium";
import { JackServices } from "./jack-module.js";
import { Program } from "./generated/ast.js";

export class JackScopeComputation extends DefaultScopeComputation {
  constructor(services: JackServices) {
    super(services);
  }

  /**
   * Exports only types (`DataType or `Entity`) with their qualified names.
   */
  override async computeExports(document: LangiumDocument, cancelToken = Cancellation.CancellationToken.None): Promise<AstNodeDescription[]> {
    const descr: AstNodeDescription[] = [];
    // for (const modelNode of AstUtils.streamAllContents(document.parseResult.value)) {
    //   await interruptAndCheck(cancelToken);
    //   if (isType(modelNode)) {
    //     let name = this.nameProvider.getName(modelNode);
    //     if (name) {
    //       if (isPackageDeclaration(modelNode.$container)) {
    //         name = this.qualifiedNameProvider.getQualifiedName(modelNode.$container as PackageDeclaration, name);
    //       }
    //       descr.push(this.descriptions.createDescription(modelNode, name, document));
    //     }
    //   }
    // }
    return descr;
  }

  override async computeLocalScopes(document: LangiumDocument, cancelToken = Cancellation.CancellationToken.None): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as Program;
    const scopes = new MultiMap<AstNode, AstNodeDescription>();
    await this.processContainer(model, scopes, document, cancelToken);
    return scopes;
  }

  protected async processContainer(
    container: Program,
    scopes: PrecomputedScopes,
    document: LangiumDocument,
    cancelToken: Cancellation.CancellationToken
  ): Promise<AstNodeDescription[]> {
    const localDescriptions: AstNodeDescription[] = [];
    for (const element of container.elements) {
      await interruptAndCheck(cancelToken);
      if (isType(element) && element.name) {
        const description = this.descriptions.createDescription(element, element.name, document);
        localDescriptions.push(description);
      } else if (isPackageDeclaration(element)) {
        const nestedDescriptions = await this.processContainer(element, scopes, document, cancelToken);
        for (const description of nestedDescriptions) {
          // Add qualified names to the container
          const qualified = this.createQualifiedDescription(element, description, document);
          localDescriptions.push(qualified);
        }
      }
    }
    scopes.addAll(container, localDescriptions);
    return localDescriptions;
  }
}
