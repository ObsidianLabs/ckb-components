import { utils, HexString } from '@ckb-lumos/base'

export default class CkbCapacity {
  #value: bigint
  #decimals: number

  constructor (value?: number | string | bigint | CkbCapacity, decimals = 8) {
    this.#decimals = decimals
    if (!value) {
      this.#value = BigInt(0)
    } else if (typeof value === 'bigint') {
      this.#value = value
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        this.#value = BigInt(value) * BigInt(10 ** decimals)
      } else {
        this.#value = BigInt(Math.round(value * 10 ** decimals))
      }
    } else if (typeof value === 'string') {
      try {
        utils.assertHexadecimal(`CkbCapacity([string])`, value)
        this.#value = BigInt(value)
      } catch (e) {
        const converted = Number(value)
        if (isNaN(converted)) {
          throw new Error(`Cannot convert '${value}' to a number.`)
        }
        return new CkbCapacity(converted, decimals)
      }
    } else if (value instanceof CkbCapacity) {
      this.#value = value.value
    }
  }

  get value () {
    return this.#value
  }

  isZero () {
    return this.#value === BigInt(0)
  }

  plus (capacity?: CkbCapacity) {
    if (!capacity) {
      return
    }
    this.#value += capacity.value
    return this
  }

  minus (capacity?: CkbCapacity) {
    if (!capacity) {
      return
    }
    this.#value -= capacity.value
    return this
  }

  inverse () {
    this.#value = -this.#value
  }

  size () {
    return Math.ceil((this.serialize().length - 2) / 2)
  }

  toString () {
    const q = this.#value / BigInt(10 ** this.#decimals)
    const r = this.#value % BigInt(10 ** this.#decimals)
    if (!r) {
      return q.toString()
    } else {
      let decimal = r.toString()
      decimal = '0'.repeat(this.#decimals - decimal.length) + decimal
      while (decimal.endsWith('0')) {
        decimal = decimal.substr(0, decimal.length - 1)
      }
      return `${q}.${decimal}`
    }
  }

  display () {
    const q = this.#value / BigInt(10 ** this.#decimals)
    const r = this.#value % BigInt(10 ** this.#decimals)

    const integer = q.toString()
    if (integer.length > 8) {
      return `${(Number(q) / 1000 / 1000).toFixed(0)}M`
    } else if (integer.length > 7) {
      return `${(Number(q) / 1000 / 1000).toFixed(1)}M`
    } else if (integer.length > 6) {
      return `${(Number(q) / 1000).toFixed(1)}k`
    } else if (integer.length > 4) {
      return `${(Number(q) / 1000).toFixed(1)}k`
    }
    
    let decimal = r.toString()
    decimal = '0'.repeat(this.#decimals - decimal.length) + decimal
    while (decimal.endsWith('0')) {
      decimal = decimal.substr(0, decimal.length - 1)
    }

    if (!decimal) {
      return integer
    } else if (integer.length > 3) {
      return `${integer}.${decimal.substr(0, 1)}`
    } else if (integer.length > 2) {
      return `${integer}.${decimal.substr(0, 2)}`
    } else {
      return `${integer}.${decimal.substr(0, 3)}`
    }
  }

  serialize () {
    return `0x${this.#value.toString(16)}` as HexString
  }
}