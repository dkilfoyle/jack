grammar Jack

entry Program:
    class=ClassDec;

ClassDec:
    "class" name=ID "{" classVarDec+=ClassVarDec* subroutineDec+=SubroutineDec* "}";

VarTypeRef:
    primitive = ("int" | "char" | "boolean") |
    reference = [ClassDec:ID];

ReturnTypeRef:
    primitive = ("int" | "char" | "boolean" | "void") |
    reference = [ClassDec:ID];

ClassVarDec:
    decType=("static" | "field") type=VarTypeRef varNames+=VarName ("," varNames+=VarName)*;

SubroutineDec:
    decType=("constructor" | "function" | "method") returnType=ReturnTypeRef name=ID "(" (parameters+=Parameter ("," parameters+=Parameter)*)? ")" SubroutineBody;

Parameter:
    type=VarTypeRef name=ID;

fragment SubroutineBody:
    "{"  varDec+=VarDec* statements+=Statement* "}";

// VarDec returns NamedElement:
// {infer VarDec} "var" type=Type name=ID ";"; //varNames+=VarName ("," varNames+=VarName)* ";";

VarDec:
    "var" type=VarTypeRef varNames+=VarName ("," varNames+=VarName)* ";";

VarName returns NamedElement:
    {infer VarName} name=ID;

Statement:
    LetStatement | IfStatement | WhileStatement | DoStatement | ReturnStatement;

LetStatement:
    "let" varName=[NamedElement:ID] ("[" indexExpression=Expression "]")? "=" expression=Expression ";";

IfStatement:
    "if" name=ID;

WhileStatement:
    "while" "(" expression=Expression ")" "{" statements+=Statement* "}";

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

//MemberCall infers Expression:
//    "(" Expression ")" |
//    NumberExpression |
//    (element=[NamedElement:ID]);

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
     NilExpression |
     FeatureCall;

 FeatureCall infers Expression:
     {infer MemberCall}
 	(element=[NamedElement:ID] | element=[NamedElement:'this'] | element=[NamedElement:'super'])
     // Optional function call after referencing an element
     (explicitOperationCall?='('
 	(
 	    arguments+=Expression (',' arguments+=Expression)*
 	)?
 	')')?;

 UnaryExpression:
     operator=('!' | '-' | '+') value=Expression;

NumberExpression:
    value=INT;
 StringExpression:
     value=STRING;
 BooleanExpression:
     value?='true' | 'false';
 NilExpression:
     value='nil';

// SubroutineCall:
//     name=ID "(" ExpressionList ")" | (className=ID|varName=ID) "." methodName=ID "(" ExpressionList ")";

// ExpressionList:
//     (expressions+=Expression ("," expression+=Expression)*)?;

type NamedElement = VarName | Parameter | SubroutineDec | ClassVarDec | ClassDec;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"[^"]*"|'[^']*'/;
terminal INT returns number: /[0-9]+/;
