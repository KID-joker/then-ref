type RawType = 'String' | 'Number' | 'BigInt' | 'Boolean' | 'Null' | 'Undefined' | 'Object' | 'Array' | 'Set' | 'Map' | 'Date' | 'RegExp' | 'URL' | 'Function' | 'Promise' | 'Error'

interface PromiseMethods {
  then: Function
  catch: Function
  finally: Function
}
interface Thenable extends PromiseMethods {
  value: any
}

function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
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

function proxyThenable(target: any, rawType?: string): any {
  const fn = isFunction(target) ? target : () => target
  fn.__RAW_TYPE__ = rawType || getRawType(target)

  return new Proxy(fn, {
    get(target, p, receiver) {
      if (target.__RAW_TYPE__ === 'Function' || isSymbol(p) || !['then', 'catch', 'finally', 'value'].includes(p)) {
        return Reflect.get(target, p, receiver)
      }
      else {
        const result = target()
        return createThenable(result, target.__RAW_TYPE__)[p as keyof Thenable]
      }
    },
    apply(target, thisArg, argArray) {
      try {
        const result = Reflect.apply(target, thisArg, argArray)
        return proxyThenable(result)
      }
      catch (error) {
        return proxyThenable(error, 'ThrowError')
      }
    },
  })
}

export default proxyThenable
