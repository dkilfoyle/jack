grammar Jack

entry Program:
    class=ClassDec;

ClassDec:
    "class" name=ID "{" fieldClassVarDec+=FieldClassVarDec* staticClassVarDec+=StaticClassVarDec* subroutineDec+=SubroutineDec* "}";

VarTypeRef:
    primitive = ("int" | "char" | "boolean") |
    reference = [ClassDec:ID];

ReturnTypeRef:
    primitive = ("int" | "char" | "boolean" | "void") |
    reference = [ClassDec:ID];

FieldClassVarDec:
    decType="field" type=VarTypeRef varNames+=VarName ("," varNames+=VarName)*;

StaticClassVarDec:
    decType="static" type=VarTypeRef varNames+=VarName ("," varNames+=VarName)*;

SubroutineDec:
    decType=("constructor" | "function" | "method") returnType=ReturnTypeRef name=ID "(" (parameters+=Parameter ("," parameters+=Parameter)*)? ")" SubroutineBody;

Parameter:
    type=VarTypeRef name=ID;

fragment SubroutineBody:
    "{"  varDec+=VarDec* statements+=Statement* "}";

VarDec:
    "var" type=VarTypeRef varNames+=VarName ("," varNames+=VarName)* ";";

VarName returns NamedElement:
    {infer VarName} name=ID;

Statement:
    LetStatement | IfStatement | WhileStatement | DoStatement | ReturnStatement;

LetStatement:
    "let" lhs=MemberCall ("[" lhsIndexExpression=Expression "]")? "=" rhsExpression=Expression ";";
    //"let" varName=[NamedElement:ID] ("[" lhsIndexExpression=Expression "]")? "=" rhsExpression=Expression ";";

IfStatement:
    "if" "(" testExpression=Expression ")"
        "{" statements+=Statement* "}"
    ("else" "{" elseStatements+=Statement* "}")?;

WhileStatement:
    "while" "(" testExpression=Expression ")" "{" statements+=Statement* "}";

DoStatement:
    "do" memberCall=MemberCall ';';

ReturnStatement:
    "return" (expression=Expression)? ";";

Expression:
    Addition;

Addition infers Expression:
    Multiplication ({infer BinaryExpression.left=current} operator=("+"|"-") right=Multiplication)*;

Multiplication infers Expression:
    Logical ({infer BinaryExpression.left=current} operator=('*' | '/') right=Logical)*;

Logical infers Expression:
    Comparison ({infer BinaryExpression.left=current} operator=('and' | 'or') right=Comparison)*;

Comparison infers Expression:
    MemberCall ({infer BinaryExpression.left=current} operator=('<' | '<=' | '>' | '>=' | '==' | '!=') right=MemberCall)*;

 MemberCall infers Expression:
     Primary
 	({infer MemberCall.previous=current} 
     // Member call with function call
         ("." element=[NamedElement:ID] (
 		explicitOperationCall?='('
 		(
 		    arguments+=Expression (',' arguments+=Expression)*
 		)?
 		')')? 
     // Chained function call
         | (
 		explicitOperationCall?='('
 		(
 		    arguments+=Expression (',' arguments+=Expression)*
 		)?
 		')'))
     )*;

 Primary infers Expression:
     '(' Expression ')' |
     UnaryExpression |
     StringExpression |
     BooleanExpression |
     NumberExpression |
     NullExpression |
     ThisExpression |
     FeatureCall;

 FeatureCall infers Expression:
     {infer MemberCall}
 	(element=[NamedElement:ID] | element=[NamedElement:'this'])
     // Optional function call after referencing an element
     (explicitOperationCall?='('
 	(
 	    arguments+=Expression (',' arguments+=Expression)*
 	)?
 	')')?
     (explicitIndex?='[' indexExpression=Expression ']')?;

 UnaryExpression:
     operator=('!' | '-' | '+') value=Expression;

NumberExpression:
    value=INT;
StringExpression:
    value=STRING;
BooleanExpression:
    value?='true' | 'false';
NullExpression:
    value='null';
ThisExpression:
    value="this";

type NamedElement = VarName | Parameter | SubroutineDec | StaticClassVarDec | FieldClassVarDec | ClassDec;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"[^"]*"|'[^']*'/;
terminal INT returns number: /[0-9]+/;
