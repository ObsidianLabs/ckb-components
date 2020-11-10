import {
  parseAddress,
  bech32Address,
  AddressPrefix,
  AddressType,
  serializeStruct,
} from '@nervosnetwork/ckb-sdk-utils'
import CkbData, { ckbDataFormat } from './CkbData'

export default class CkbArgs {
  #args: CkbData[]

  constructor (param?: string | CkbData | CkbData[] | CkbArgs, format: ckbDataFormat = 'utf8') {
    if (!param) {
      this.#args = []
    } else if (typeof param === 'string') {
      this.#args = [new CkbData(param, format)]
    } else if (param instanceof CkbData) {
      this.#args = [param]
    } else if (param instanceof CkbArgs) {
      this.#args = [...param.value]
    } else {
      this.#args = [...param]
    }
  }

  static FromAddress (address: string) {
    let pubkeyHash
    try {
      const parsed = parseAddress(address, 'hex')
      pubkeyHash = '0x' + parsed.slice(6)
    } catch (e) {
      throw new Error(`Invalid address: ${address}`)
    }
    return new CkbArgs(pubkeyHash, 'hex')
  }

  pushArg (arg: CkbData) {
    this.#args.push(arg)
  }

  get value () {
    return this.#args
  }

  size () {
    return this.#args.map(arg => arg.size()).reduce((x, y) => x + y, 0)
  }

  toAddress (prefix) {
    return bech32Address(this.serialize(), {
      prefix: AddressPrefix.Testnet,
      type: AddressType.HashIdx,
      codeHashOrCodeHashIndex: '0x00'
    })
  }

  toString () {
    return this.#args.map(arg => arg.toString()).toString()
  }

  serialize () : string {
    if (this.#args.length === 0) {
      return '0x'
    } else if (this.#args.length === 1) {
      return this.#args[0].serialize()
    }
    const kvs = Array.from(this.#args.map(arg => arg.serialize()).entries())
      .map(([k, v]) => [k.toString(), v]) as Array<readonly [string, string]>
    return serializeStruct(new Map(kvs.values()))
  }
}
