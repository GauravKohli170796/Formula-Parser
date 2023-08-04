import { functionIsSupported } from './suppotedFunctions'
import { ErrorType, TokenType, operatorAllowedAfter, type Token, type ValidationError } from './types'

const operatorRequiredMap: Partial<Record<TokenType, ErrorType>> = {
  [TokenType.Number]: ErrorType.OperatorRequiredBeforeNumber,
  [TokenType.FunctionName]: ErrorType.OperatorRequiredBeforeFunction,
  [TokenType.QuoteStart]: ErrorType.OperatorRequiredBeforeQuote,
  [TokenType.DoubleQuoteStart]: ErrorType.OperatorRequiredBeforeQuote
}

const startToEndMap: Partial<Record<TokenType, TokenType>> = {
  [TokenType.QuoteEnd]: TokenType.QuoteStart,
  [TokenType.DoubleQuoteEnd]: TokenType.DoubleQuoteStart
}

const valueAllowedAfter = [
  TokenType.Operator,
  TokenType.Comma,
  TokenType.BracketStart
]

const unclosedErrorMap: Partial<Record<TokenType, ErrorType>> = {
  [TokenType.QuoteStart]: ErrorType.UnclosedQuote,
  [TokenType.DoubleQuoteStart]: ErrorType.UnclosedDoubleQuote,
  [TokenType.FunctionName]: ErrorType.UnclosedBracket,
  [TokenType.Group]: ErrorType.UnclosedBracket,
  [TokenType.ReferenceName]: ErrorType.UnclosedReferenceBracket,
  [TokenType.IfCondition]: ErrorType.UnclosedIfConditionBracket,
  [TokenType.ConditionBracketStart]: ErrorType.UnclosedConditionBracket,
  [TokenType.ReferenceVariableStart]: ErrorType.EmptyVariableName
}

//"max({transactions}, {averageTransactionAmount}) + 10"
export function getValidationErrors(tokens: Token[], supportedRefs?: string[]) {
  const errors: ValidationError[] = []
  const unclosedTokens: { token: Token; tokenIndex: number; type: TokenType }[] = []
  const supportedRefsLowerCase = supportedRefs?.map(ref => ref.toLowerCase())
  let functionLevel = 0
  let prev: Token | null = null
  let prevIndex = 0
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    const addError = (errorType: ErrorType) => errors.push({ token, tokenIndex, errorType })
    const token = tokens[tokenIndex]

    if (token.type === TokenType.Operator) {
      if (!prev || !operatorAllowedAfter.includes(prev.type)) {
        addError(ErrorType.UnexpectedOperator)
      }
    }

    if (operatorRequiredMap[token.type] && prev && ![...valueAllowedAfter,TokenType.ReturnKeyword, TokenType.ConditionBracketStart].includes(prev.type)) {
      addError(operatorRequiredMap[token.type] as ErrorType)
    }

    if (token.type === TokenType.FunctionName && !functionIsSupported(token.value)) {
      addError(ErrorType.InvalidFunction)
    }

    if ([TokenType.QuoteStart, TokenType.DoubleQuoteStart].includes(token.type)) {
      unclosedTokens.push({ token, tokenIndex, type: token.type })
    }

    if (startToEndMap[token.type]) {
      if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].token.type === startToEndMap[token.type]) {
        unclosedTokens.pop()
      }
    }

    if (token.type === TokenType.Comma) {
      if (functionLevel <= 0 || !prev || !operatorAllowedAfter.includes(prev.type)) {
        addError(ErrorType.UnexpectedComma)
      }
    }

    if (token.type === TokenType.IfCondition) {
      if (prev && prev.type !== TokenType.ConditionBracketStart) {
        addError(ErrorType.UnexpectedIfCondition)
      }
    }

    if (token.type === TokenType.ElseIfCondition) {
      if (!prev || prev.type!== TokenType.ConditionBracketEnd) {
        addError(ErrorType.UnexpectedElseIfCondition)
      }
    }

    if (token.type === TokenType.ElseCondition) {
      if (!prev || prev.type!== TokenType.ConditionBracketEnd) {
        addError(ErrorType.UnexpectedElseCondition)
      }
    }

    if (token.type === TokenType.ReturnKeyword) {
      if (!prev || prev.type!== TokenType.ConditionBracketStart) {
        addError(ErrorType.UnexpectedReturn)
      }
    }

    if(token.type === TokenType.ConditionBracketStart){
      unclosedTokens.push({ token, tokenIndex, type: TokenType.ConditionBracketStart});
      if(!prev || ![TokenType.BracketEnd, TokenType.ElseCondition].includes(prev.type)){
        addError(ErrorType.UnexpectedConditionBracket)
      }
    }

    if(token.type === TokenType.ConditionBracketEnd){
      if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.ConditionBracketStart) {
        unclosedTokens.pop();
        if(!prev || prev?.type=== TokenType.ConditionBracketStart){
          addError(ErrorType.EmptyCondition);
        }
      }
      else{
        addError(ErrorType.UnexpectedConditionBracket)
      }
    }

    if (token.type === TokenType.Error) {
      addError(ErrorType.InvalidCharacter)
    }

    if (token.type === TokenType.BracketStart) {
      unclosedTokens.push({ token, tokenIndex, type: (prev?.type === TokenType.FunctionName) ? TokenType.FunctionName : (prev?.type === TokenType.IfCondition ? TokenType.IfCondition : TokenType.Group) })
      if (prev?.type === TokenType.FunctionName) {
        functionLevel++
      } else if (prev && ![TokenType.IfCondition,TokenType.ElseIfCondition].includes(prev.type) && ![...valueAllowedAfter,TokenType.ReturnKeyword].includes(prev.type)) {
        addError(ErrorType.OperatorRequiredBeforeBracket)
      }
    }

    if (token.type === TokenType.BracketEnd) {
      if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.FunctionName) {
        functionLevel--
        unclosedTokens.pop()
        if (!prev || (!operatorAllowedAfter.includes(prev.type))) {
          addError(ErrorType.UnexpectedBracket)
        }
      }
      else if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.IfCondition) {
        unclosedTokens.pop();
        if(prev && prev.type === TokenType.BracketStart){
          addError(ErrorType.EmptyIfCondition);
        }
        if (!prev || (!operatorAllowedAfter.includes(prev.type) && prev.type !== TokenType.BracketStart)) {
          addError(ErrorType.UnexpectedBracket)
        }
      }
      else if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.Group) {
        unclosedTokens.pop()
        if (!prev || (!operatorAllowedAfter.includes(prev.type) && prev.type !== TokenType.BracketStart)) {
          addError(ErrorType.UnexpectedBracket)
        }
      } else {
        addError(ErrorType.UnexpectedBracket)
      }
    }

    if (token.type === TokenType.ReferenceVariableStart) {
      unclosedTokens.push({ token, tokenIndex, type: TokenType.ReferenceVariableStart})
      if (prev && ![...valueAllowedAfter,TokenType.ReturnKeyword, TokenType.ConditionBracketStart].includes(prev.type)) {
        addError(ErrorType.OperatorRequiredBeforeReference)
      }
    }

    if (token.type === TokenType.ReferenceName && token.value) {
      if(supportedRefsLowerCase?.includes(token.value.toLowerCase())){
        if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.ReferenceVariableStart) {
          unclosedTokens.pop();
        }
       }
      else{
        unclosedTokens.pop();
        addError(ErrorType.UnsupportedReferenceName)
      }
    }

    // if (token.type === TokenType.ReferenceBracketEnd) {
    //   if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.ReferenceName) {
    //     unclosedTokens.pop()
    //     if (!prev || prev.type !== TokenType.ReferenceName) {
    //       addError(ErrorType.ReferenceNameRequiredInBrackets)
    //     }
    //   } else {
    //     addError(ErrorType.UnexpectedReferenceBracket)
    //   }
    // }

    if (token.type !== TokenType.Whitespace) {
      prev = token
      prevIndex = tokenIndex
    }
  }

  if (prev?.type === TokenType.Operator) {
    errors.push({ token: prev, tokenIndex: prevIndex, errorType: ErrorType.ValueRequiredAfterOperator })
  }

  unclosedTokens.forEach(({ token, tokenIndex, type }) => {
    if (unclosedErrorMap[type]) {
      errors.push({ token, tokenIndex, errorType: unclosedErrorMap[type] as ErrorType })
    }
  })
  return errors
}