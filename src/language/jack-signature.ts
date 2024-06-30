import { AbstractSignatureHelpProvider } from "langium/lsp";
import { JackServices } from "./jack-module.js";
import { AstNode, LangiumDocument, MaybePromise, CstUtils, DocumentationProvider, CommentProvider } from "langium";
import {
  CancellationToken,
  SignatureHelp,
  SignatureHelpParams,
  SignatureInformation,
  ParameterInformation,
  SignatureHelpOptions,
} from "vscode-languageserver";
import { isMemberCall, isSubroutineDec } from "./generated/ast.js";
import { parse as commentParser } from "comment-parser";
import * as _ from "lodash";

export class JackSignatureHelpProvider extends AbstractSignatureHelpProvider {
  documentationProvider: DocumentationProvider;
  commentProvider: CommentProvider;
  currentSignatureStack: SignatureHelp[];

  constructor(services: JackServices) {
    super();
    this.documentationProvider = services.documentation.DocumentationProvider;
    this.commentProvider = services.documentation.CommentProvider;
    this.currentSignatureStack = [];
  }

  override provideSignatureHelp(
    document: LangiumDocument,
    params: SignatureHelpParams,
    cancelToken = CancellationToken.None
  ): MaybePromise<SignatureHelp | undefined> {
    const cst = document.parseResult.value.$cstNode;
    if (cst) {
      const curOffset = document.textDocument.offsetAt(params.position);
      const nodeAt = CstUtils.findLeafNodeAtOffset(cst, curOffset)?.astNode;
      // console.log("Node At", nodeAt);
      if (isMemberCall(nodeAt)) {
        if (params.context?.triggerCharacter == ")") {
          this.currentSignatureStack.pop();
          return _.last(this.currentSignatureStack);
        } else if (params.context?.triggerCharacter == ",") {
          _.last(this.currentSignatureStack)!.activeParameter = nodeAt.arguments.length;
          return _.last(this.currentSignatureStack);
        } else if (params.context?.triggerCharacter == "(") return this.getSignatureFromElement(nodeAt, cancelToken);
        else {
          // not trigger
          return _.last(this.currentSignatureStack);
        }
      }
    }
    // else {
    //   const sourceCstNode = CstUtils.findLeafNodeBeforeOffset(cst, document.textDocument.offsetAt(params.position));
    //   if (sourceCstNode && params.context?.activeSignatureHelp) {
    //     // console.log("not trigger", {
    //     //   sourceCstNode,
    //     //   context: params.context?.activeSignatureHelp,
    //     //   isMember: isMemberCall(sourceCstNode?.astNode.$container),
    //     // });

    //     let memberArgs: Expression[] | undefined = undefined;
    //     let activeParameter;
    //     if (isMemberCall(sourceCstNode.astNode)) {
    //       // cursor is at space
    //       memberArgs = sourceCstNode.astNode.arguments;
    //       activeParameter = memberArgs.length;
    //     } else if (isMemberCall(sourceCstNode.astNode.$container)) {
    //       // cursor is at an argument
    //       memberArgs = sourceCstNode.astNode.$container.arguments;
    //       activeParameter = memberArgs.length - 1;
    //     }

    //     console.log("not trigger activeParameter", activeParameter, sourceCstNode);

    //     if (memberArgs !== undefined) {
    //       return {
    //         signatures: this.currentSignatureStack[this.currentSignatureStack.length - 1].signatures,
    //         activeSignature: 0,
    //         activeParameter,
    //       };
    //     }
    //   }
    // }
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
        const jsdoc = commentParser(this.commentProvider.getComment(subroutineDec) || "");
        const paramDocs: (string | undefined)[] = [];
        let signatureDocumentation;
        if (jsdoc.length == 1) {
          signatureDocumentation = jsdoc[0].description;
          jsdoc[0].tags.filter((t) => t.tag == "param").forEach((t) => paramDocs.push(t.description));
        }

        let title = `${subroutineDec.returnType.$cstNode?.text} ${subroutineDec.name}(`;
        const params = subroutineDec.parameters.map((p, i) => {
          const start = title.length;
          title = title + `${p.type.$cstNode!.text} ${p.name}`;
          const end = title.length;
          if (i < subroutineDec.parameters.length - 1) title += ", ";
          return ParameterInformation.create([start, end], paramDocs[i]);
        });
        signatures.push(SignatureInformation.create(title + ")", signatureDocumentation, ...params));
      }
    }
    // console.log("getSignature", element, signatures, activeParameter);
    const newSignature = { signatures, activeParameter, activeSignature: 0 };
    this.currentSignatureStack.push(newSignature);
    return newSignature;
  }

  override get signatureHelpOptions(): SignatureHelpOptions {
    return {
      triggerCharacters: ["(", ")", ","],
      retriggerCharacters: [],
    };
  }
}
