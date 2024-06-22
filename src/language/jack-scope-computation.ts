import type { AstNode, AstNodeDescription, LangiumDocument, PrecomputedScopes } from "langium";
import { AstUtils, Cancellation, DefaultScopeComputation, interruptAndCheck, MultiMap } from "langium";
import { JackServices } from "./jack-module.js";
// import { ClassDec, isClassDec, isSubroutineDec, isVarName } from "./generated/ast.js";
import { isVarName } from "./generated/ast.js";

export class JackScopeComputation extends DefaultScopeComputation {
  constructor(services: JackServices) {
    super(services);
  }

  /**
   * Exports only types (`DataType or `Entity`) with their qualified names.
   */
  // override async computeExports(document: LangiumDocument, cancelToken = Cancellation.CancellationToken.None): Promise<AstNodeDescription[]> {
  //   const exports: AstNodeDescription[] = [];
  //   for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
  //     await interruptAndCheck(cancelToken);
  //     if (isClassDec(node)) {
  //       exports.push(this.descriptions.createDescription(node, this.nameProvider.getName(node)));
  //     } else if (isSubroutineDec(node)) {
  //       console.log("subroutdec", node, node.name, node.returnType);
  //       const className = this.nameProvider.getName(node.$container as ClassDec);
  //       if (node.decType == "constructor") {
  //         exports.push(this.descriptions.createDescription(node, className + ".new"));
  //       } else if (node.decType == "function") {
  //         let subroutName = this.nameProvider.getName(node);
  //         if (subroutName) {
  //           exports.push(this.descriptions.createDescription(node, className + "." + subroutName));
  //         }
  //       }
  //     }
  //   }
  //   console.log("exports for document ", document, exports);
  //   return exports;
  // }

  // override async computeLocalScopes(document: LangiumDocument, cancelToken = Cancellation.CancellationToken.None): Promise<PrecomputedScopes> {
  //   const model = document.parseResult.value as Program;
  //   const scopes = new MultiMap<AstNode, AstNodeDescription>();
  //   await this.processContainer(model, scopes, document, cancelToken);
  //   return scopes;
  // }

  // protected async processContainer(
  //   container: Program,
  //   scopes: PrecomputedScopes,
  //   document: LangiumDocument,
  //   cancelToken: Cancellation.CancellationToken
  // ): Promise<AstNodeDescription[]> {
  //   const localDescriptions: AstNodeDescription[] = [];
  //   for (const element of container.elements) {
  //     await interruptAndCheck(cancelToken);
  //     if (isType(element) && element.name) {
  //       const description = this.descriptions.createDescription(element, element.name, document);
  //       localDescriptions.push(description);
  //     } else if (isPackageDeclaration(element)) {
  //       const nestedDescriptions = await this.processContainer(element, scopes, document, cancelToken);
  //       for (const description of nestedDescriptions) {
  //         // Add qualified names to the container
  //         const qualified = this.createQualifiedDescription(element, description, document);
  //         localDescriptions.push(qualified);
  //       }
  //     }
  //   }
  //   scopes.addAll(container, localDescriptions);
  //   return localDescriptions;
  // }

  override async computeLocalScopes(document: LangiumDocument, cancelToken = Cancellation.CancellationToken.None): Promise<PrecomputedScopes> {
    const rootNode = document.parseResult.value;
    const scopes = new MultiMap<AstNode, AstNodeDescription>();
    // Here we navigate the full AST - local scopes shall be available in the whole document
    for (const node of AstUtils.streamAllContents(rootNode)) {
      await interruptAndCheck(cancelToken);
      this.processNode(node, document, scopes);
    }
    return scopes;
  }

  /**
   * Process a single node during scopes computation. The default implementation makes the node visible
   * in the subtree of its container (if the node has a name). Override this method to change this,
   * e.g. by increasing the visibility to a higher level in the AST.
   */
  protected override processNode(node: AstNode, document: LangiumDocument, scopes: PrecomputedScopes): void {
    // boost each varName to be sibling of VarDec's container
    // this allows to declare multiple varNames in one VarDec
    // eg var int x,y;
    const container = isVarName(node) ? node.$container.$container : node.$container;
    if (container) {
      const name = this.nameProvider.getName(node);
      if (name) {
        scopes.add(container, this.descriptions.createDescription(node, name, document));
      }
    }
  }
}
