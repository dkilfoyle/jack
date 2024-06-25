import { AbstractSignatureHelpProvider } from "langium/lsp";
import { JackServices } from "./jack-module.js";
import { AstNode, LangiumDocument, MaybePromise, CstUtils, DocumentationProvider } from "langium";
import {
  CancellationToken,
  SignatureHelp,
  SignatureHelpParams,
  SignatureInformation,
  ParameterInformation,
  SignatureHelpOptions,
} from "vscode-languageserver";
import { Expression, isMemberCall, isSubroutineDec } from "./generated/ast.js";

export class JackSignatureHelpProvider extends AbstractSignatureHelpProvider {
  documentationProvider: DocumentationProvider;
  constructor(services: JackServices) {
    super();
    this.documentationProvider = services.documentation.DocumentationProvider;
  }

  override provideSignatureHelp(
    document: LangiumDocument,
    params: SignatureHelpParams,
    cancelToken = CancellationToken.None
  ): MaybePromise<SignatureHelp | undefined> {
    const rootNode = document.parseResult.value;
    const cst = rootNode.$cstNode;
    if (cst) {
      if (params.context?.triggerCharacter) {
        if (params.context.triggerCharacter == ")") return undefined;
        // cursor at ( or ,
        const sourceCstNode = CstUtils.findLeafNodeBeforeOffset(cst, document.textDocument.offsetAt(params.position));
        if (sourceCstNode) return this.getSignatureFromElement(sourceCstNode.astNode, cancelToken);
      } else {
        const sourceCstNode = CstUtils.findLeafNodeBeforeOffset(cst, document.textDocument.offsetAt(params.position));
        if (sourceCstNode && params.context?.activeSignatureHelp) {
          // console.log("not trigger", {
          //   sourceCstNode,
          //   context: params.context?.activeSignatureHelp,
          //   isMember: isMemberCall(sourceCstNode?.astNode.$container),
          // });

          let memberArgs: Expression[] | undefined = undefined;
          let activeParameter;
          if (isMemberCall(sourceCstNode.astNode)) {
            // cursor is at space
            memberArgs = sourceCstNode.astNode.arguments;
            activeParameter = memberArgs.length;
          } else if (isMemberCall(sourceCstNode.astNode.$container)) {
            // cursor is at an argument
            memberArgs = sourceCstNode.astNode.$container.arguments;
            activeParameter = memberArgs.length - 1;
          }

          if (memberArgs !== undefined)
            return {
              signatures: params.context?.activeSignatureHelp.signatures,
              activeSignature: 0,
              activeParameter,
            };
        }
      }
    }
    return undefined;
  }

  protected override getSignatureFromElement(element: AstNode, cancelToken: CancellationToken): MaybePromise<SignatureHelp | undefined> {
    const signatures: SignatureInformation[] = [];
    let activeParameter = 0;
    if (isMemberCall(element) && element.element?.$nodeDescription) {
      const node = element.element.$nodeDescription;
      activeParameter = element.arguments.length;
      if (isSubroutineDec(node.node)) {
        const subroutineDec = node.node;
        let title = subroutineDec.name + "(";
        const params = subroutineDec.parameters.map((p, i) => {
          const start = title.length;
          title = title + `${p.type.$cstNode!.text} ${p.name}`;
          const end = title.length;
          if (i < subroutineDec.parameters.length - 1) title += ", ";
          return ParameterInformation.create([start, end], undefined);
        });
        signatures.push(SignatureInformation.create(title + ")", this.documentationProvider.getDocumentation(subroutineDec), ...params));
      }
    }
    // console.log("getSignature", element, signatures, activeParameter);
    return { signatures, activeParameter, activeSignature: 0 };
  }

  override get signatureHelpOptions(): SignatureHelpOptions {
    return {
      triggerCharacters: ["(", ")"],
      retriggerCharacters: [],
    };
  }
}
