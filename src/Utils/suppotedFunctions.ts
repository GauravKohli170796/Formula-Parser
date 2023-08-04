
const supportedFunctions = {
    uppercase: (params: string[]) => {
      return params.map(param => param.toUpperCase()).join('')
    },
    lowercase: (params: string[]) => {
      return params.map(param => param.toLowerCase()).join('')
    },
    concatenate: (params: string[]) => {
      return params.join('')
    },
    round: (params: string[]) => {
      if (params.length > 0) {
        const out = (Number.EPSILON + Number(params[0] || '')).toFixed(Number(params[1]) || 0)
        if (paramAsBooleanIsSet(params[2])) {
          return out
        }
        return stripLastZeroesAfterDot(out)
      }
      return (Number.NaN).toString()
    },
    floor: (params: string[]) => {
      if (params.length > 0) {
        const mult = Math.pow(10, Number(params[1]) || 0)
        const out = (Math.floor(Number(params[0]) * mult) / mult).toFixed(Number(params[1]) || 0)
        if (paramAsBooleanIsSet(params[2])) {
          return out
        }
        return stripLastZeroesAfterDot(out)
      }
      return (Number.NaN).toString()
    },
    sum: (params: string[]) => {
      return params.reduce((out: string, param) => {
        if (!isNaN(Number(out)) && !isNaN(Number(param))) {
          return toNumberString(Number(out) + Number(param))
        } else {
          return (Number.NaN).toString()
        }
      }, '0')
    },
    multiply: (params: string[]) => {
      return params.reduce((out: string, param) => {
        if (!isNaN(Number(out)) && !isNaN(Number(param))) {
          return toNumberString(Number(out) * Number(param))
        } else {
          return (Number.NaN).toString()
        }
      }, '1')
    },
    subtract: (params: string[]) => {
      params = [...params]
      const first = params.shift()
      const rest = supportedFunctions.sum(params)
      if (!isNaN(Number(first)) && !isNaN(Number(rest))) {
        return toNumberString(Number(first) - Number(rest))
      }
      return (Number.NaN).toString()
    },
    divide: (params: string[]) => {
      params = [...params]
      const first = params.shift()
      const rest = supportedFunctions.multiply(params)
      if (!isNaN(Number(first)) && !isNaN(Number(rest)) && Number(rest)) {
        return toNumberString(Number(first) / Number(rest))
      }
      return (Number.NaN).toString()
    },
    max: (params: string[]) => {
      if (!params.length) {
        return (Number.NaN).toString()
      }
      return params.reduce((out: string, param) => {
        if (!isNaN(Number(out)) && !isNaN(Number(param))) {
          return Math.max(Number(out), Number(param)).toString()
        } else {
          return (Number.NaN).toString()
        }
      }, params[0])
    },
    min: (params: string[]) => {
      if (!params.length) {
        return (Number.NaN).toString()
      }
      return params.reduce((out: string, param) => {
        if (!isNaN(Number(out)) && !isNaN(Number(param))) {
          return Math.min(Number(out), Number(param)).toString()
        } else {
          return (Number.NaN).toString()
        }
      }, params[0])
    },

    lookup : ()=>{
       // No method defination , Its here so that it will be treated as a valid function
       return 'Lookup Function Called';
    }
  }
  
  const supportedOperators = {
    '&': supportedFunctions.concatenate,
    '+': supportedFunctions.sum,
    '-': supportedFunctions.subtract,
    '/': supportedFunctions.divide,
    '*': supportedFunctions.multiply
  }
  
  export function executeOperator (operator: string, parameters: string[]) {
    if (operator in supportedOperators) {
      return supportedOperators[operator as keyof typeof supportedOperators](parameters)
    }
    return ''
  }
  
  export function executeFunction (name: string, parameters: string[]) {
    name = name.toLowerCase()
    if (name in supportedFunctions) {
      return supportedFunctions[name as keyof typeof supportedFunctions](parameters)
    }
    return ''
  }
  
  export function functionIsSupported (name: string) {
    name = name.toLowerCase()
    return (name in supportedFunctions)
  }
  
  export function toNumberString (n: number) {
    return Number(n.toFixed(10)).toString()
  }
  
  function paramAsBooleanIsSet (param?: string | undefined) {
    param = (param || '').toLowerCase()
    return param && param !== '0' && param !== 'false' && param !== 'no'
  }
  
  function stripLastZeroesAfterDot (param: string) {
    if (param.match(/\./)) {
      return param.replace(/0+$/, '').replace(/\.$/, '')
    }
    return param
  }
  
  function compare (params: string[], operator: '<' | '<=' | '=' | '>=' | '>') {
    if (params.length < 2) {
      return '0'
    }
    const p0 = isNaN(Number(params[0])) ? params[0] : Number(params[0])
    const p1 = isNaN(Number(params[1])) ? params[1] : Number(params[1])
    if (operator.includes('=') && p0 === p1) {
      return '1'
    }
    if (operator.includes('<') && p0 < p1) {
      return '1'
    }
    if (operator.includes('>') && p0 > p1) {
      return '1'
    }
    return '0'
  }