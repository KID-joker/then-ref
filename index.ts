type RawType = 'String' | 'Number' | 'BigInt' | 'Boolean' | 'Null' | 'Undefined' | 'Object' | 'Array' | 'Set' | 'Map' | 'Date' | 'RegExp' | 'URL' | 'Function' | 'Promise' | 'Error'

interface PromiseMethods {
  then: Function
  catch: Function
  finally: Function
}
export interface Thenable extends PromiseMethods {
  value: any
}

function isSymbol(val: unknown): val is symbol {
  return typeof val === 'symbol'
}

function getTypeString(value: unknown): string {
  return Object.prototype.toString.call(value)
}

function getRawType(value: unknown): RawType {
  return getTypeString(value).slice(8, -1) as RawType
}

function createThenable(value: any, rawType: string): Thenable {
  return {
    then(onfulfilled?: Function | undefined | null, onrejected?: Function | undefined | null) {
      if (rawType === 'Promise') {
        return proxyThenable(value.then(onfulfilled, onrejected))
      }
      else if (rawType === 'ThrowError' && onrejected) {
        try {
          const result = onrejected(value)
          return proxyThenable(result)
        }
        catch (error) {
          return proxyThenable(error, 'ThrowError')
        }
      }
      else if (rawType !== 'ThrowError' && onfulfilled) {
        try {
          const result = onfulfilled(value)
          return proxyThenable(result)
        }
        catch (error) {
          return proxyThenable(error, 'ThrowError')
        }
      }
      else {
        return proxyThenable(value, rawType)
      }
    },
    catch(onrejected?: Function | undefined | null) {
      if (rawType === 'Promise') {
        return proxyThenable(value.catch(onrejected))
      }
      else if (rawType === 'ThrowError' && onrejected) {
        try {
          const result = onrejected(value)
          return proxyThenable(result)
        }
        catch (error) {
          return proxyThenable(error, 'ThrowError')
        }
      }
      else {
        return proxyThenable(value, rawType)
      }
    },
    finally(onfinally?: Function | undefined | null) {
      if (rawType === 'Promise') {
        return proxyThenable(value.finally(onfinally))
      }
      else {
        onfinally && onfinally()
        return proxyThenable(value, rawType)
      }
    },
    value,
  }
}

const RAW_TYPE = Symbol('RAW_TYPE')
const IS_PROXY = Symbol('IS_PROXY')

function proxyThenable(target: any, rawType?: string): any {
  if (target[IS_PROXY])
    return target

  const fn = () => target
  fn[RAW_TYPE] = rawType || getRawType(target)
  fn[IS_PROXY] = true

  return new Proxy(fn, {
    get(target, p, receiver) {
      if (isSymbol(p) && [RAW_TYPE, IS_PROXY].includes(p)) {
        return Reflect.get(target, p, receiver)
      }
      else {
        const result = target()
        if (target[RAW_TYPE] === 'Function' || isSymbol(p) || !['then', 'catch', 'finally', 'value'].includes(p)) {
          return Reflect.get(result, p, receiver)
        }
        else {
          return createThenable(result, target[RAW_TYPE])[p as keyof Thenable]
        }
      }
    },
    apply(target, thisArg, argArray) {
      const result = target()
      try {
        const value = Reflect.apply(result, thisArg, argArray)
        return proxyThenable(value)
      }
      catch (error) {
        return proxyThenable(error, 'ThrowError')
      }
    },
  })
}

export default proxyThenable
